import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Form, Container, Spinner, Alert } from 'react-bootstrap';

const Arrivals = () => {
    const [stops, setStops] = useState([]);
    const [selectedStop, setSelectedStop] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch Stops
    useEffect(() => {
        async function fetchStops() {
            try {
                const response = await axios.get('https://api-v3.mbta.com/stops?filter[route_type]=0,1');
                
                const uniqueStops = response.data.data.filter((stop, index, self) =>
                    index === self.findIndex((s) => s.attributes.name === stop.attributes.name)
                );

                const sortedStops = uniqueStops.sort((a, b) => 
                    a.attributes.name.localeCompare(b.attributes.name)
                );

                setStops(sortedStops);
            } catch (err) {
                setError("Failed to load stops.");
            }
        }
        fetchStops();
    }, []);

    // Fetch Predictions
    useEffect(() => {
        if (!selectedStop) return;

        async function fetchLiveTime() {
            setLoading(true);
            try {
                const result = await axios.get(`https://api-v3.mbta.com/predictions?filter[stop]=${selectedStop}`);
                setPredictions(result.data.data);
                setError(null);
            } catch (err) {
                setError("Could not fetch live predictions.");
            } finally {
                setLoading(false);
            }
        }
        fetchLiveTime();
    }, [selectedStop]);

    // --- BUG FIX 1: Filter Logic Moved Here ---
    // We process the data BEFORE rendering so we know exactly how many cards we have.
    const validPredictions = predictions
        .filter(pred => {
            // BUG FIX 2: Safety check for null arrival times
            if (!pred.attributes.arrival_time) return false;

            const arrival = new Date(pred.attributes.arrival_time);
            const now = new Date();
            const diffInMinutes = (arrival - now) / (1000 * 60);
    
            return diffInMinutes > 0 && diffInMinutes <= 60;
        })
        .sort((a, b) => {
             // Optional: Sort by time so soonest is first
             return new Date(a.attributes.arrival_time) - new Date(b.attributes.arrival_time);
        });

    return (
        <Container className="my-4">
            <h1>MBTA Arrivals</h1>

            <Form.Group className="mb-4">
                <Form.Label>Select a Station</Form.Label>
                <Form.Select 
                    value={selectedStop} 
                    onChange={(e) => setSelectedStop(e.target.value)}
                >
                    <option value="">-- Choose a Stop --</option>
                    {stops.map(stop => (
                        <option key={stop.id} value={stop.id}>
                            {stop.attributes.name}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {error && <Alert variant="danger">{error}</Alert>}
            {loading && <Spinner animation="border" variant="primary" />}

            <div className="d-flex flex-wrap gap-3">
                {/* Check length of validPredictions, not the raw list */}
                {validPredictions.length > 0 ? (
                    validPredictions.map(pred => {
                        const arrival = new Date(pred.attributes.arrival_time);
                        const now = new Date();
                        const diffInMinutes = (arrival - now) / (1000 * 60);

                        // Urgency Logic
                        const isApproaching = (diffInMinutes > 0 && diffInMinutes <= 5);
                        
                        return (
                            <Card 
                                key={pred.id}
                                bg={isApproaching ? "danger" : "light"}
                                text={isApproaching ? "white" : "dark"}
                                style={{ width: '18rem' }}
                            >
                                <Card.Body>
                                    <Card.Title>
                                        {isApproaching ? "🚨 Approaching" : "Upcoming Train"}
                                    </Card.Title>
                                    <Card.Text>
                                        <strong>Status:</strong> {pred.attributes.status || "In Transit"} <br />
                                        <strong>Arrival:</strong> {arrival.toLocaleTimeString()}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        );
                    })
                ) : (
                    // Now this will actually show if the filter removed everything!
                    selectedStop && !loading && <p>No trains arriving in the next hour.</p>
                )}
            </div>
        </Container>
    );
};

export default Arrivals;