import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import axios from 'axios';

function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const result = await axios.get(
        'https://api-v3.mbta.com/alerts?sort=banner&filter%5Bactivity%5D=BOARD%2CEXIT%2CRIDE'
      );
      console.log("What is result.data?", result.data);
      setAlerts(result.data.data);
    }
    fetchData();
  }, []);
  return (
    <div>
      {alerts.map(alert => (
        <Card
          body
          outline
          color="success"
          className="mx-1 my-2"
          style={{ width: "30rem" }}
        >
          <Card.Body>
            <Card.Title>MBTA Alert</Card.Title>
            <Card.Text>
              {alert.attributes.header}
              {alert.attributes.description}
            </Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  )
}

export default Alerts;