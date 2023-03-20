import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import './App.css';

const Plant = ({ name, lastWatered }) => {
  return (
    <div className="plant">
      <h3>{name}</h3>
      <p>Last watered: {lastWatered.toLocaleString()}</p>
    </div>
  );
};

const App = () => {
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    const client = mqtt.connect('ws://your-mqtt-broker-ip:your-websocket-port');

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      client.subscribe('plants/+/watered');
    });

    client.on('message', (topic, message) => {
      const [, plantId] = topic.split('/');
      const lastWatered = new Date(parseInt(message.toString(), 10));

      setPlants((prevPlants) => {
        const plantIndex = prevPlants.findIndex((p) => p.id === plantId);
        if (plantIndex !== -1) {
          const newPlants = [...prevPlants];
          newPlants[plantIndex].lastWatered = lastWatered;
          return newPlants;
        } else {
          return [...prevPlants, { id: plantId, name: `Plant ${plantId}`, lastWatered }];
        }
      });
    });

    return () => {
      client.end();
    };
  }, []);

  return (
    <div className="App">
      <h1>Plant Watering Dashboard</h1>
      <div className="plant-shelf">
        {plants.map((plant) => (
          <Plant key={plant.id} name={plant.name} lastWatered={plant.lastWatered} />
        ))}
      </div>
    </div>
  );
};

export default App;