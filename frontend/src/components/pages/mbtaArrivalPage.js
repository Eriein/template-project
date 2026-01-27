import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import axios from 'axios';

function Predictions() {
    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const result = await axios.get(
                'https://api-v3.mbta.com/predictions?filter[stop]=place-sstat'
            );
            console.log("What is result.data?", result.data);
            setPredictions(result.data.data);
        }
        fetchData();
    }, []);
    return (
    <div>
      {predictions.map(prediction => (
        <Card
        body
        outline
        color="success"
        className="mx-1 my-2"
        style={{ width: "30rem" }}
      >
        <Card.Body>
        <Card.Title>Prediction</Card.Title>
        <Card.Text>
          {prediction.attributes.status}
          {prediction.attributes.arrival_time}
          {prediction.attributes.departure_time}
        </Card.Text>
        </Card.Body>
      </Card>
      ))}
    </div>
    )
}

export default Predictions;