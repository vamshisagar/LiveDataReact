import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';

function App() {
  const [table1Records, setTable1Records] = useState([]);
  const [table2Records, setTable2Records] = useState([]);
  const [message, setMessage] = useState("");

  // State variables for incidents
  const [incidentCounts, setIncidentCounts] = useState(null);

  useEffect(() => {
    // Fetch initial data for both tables and incidents
    fetchTable1Records();
    fetchTable2Records();
    fetchIncidentCounts();

    // Set up SignalR connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5223/dataHub", { withCredentials: true })
      .build();

    connection.start().then(() => {
      console.log("Connected to SignalR hub!");

      // Listen for updates for Table 1
      connection.on("ReceiveTable1Update", (updatedTable1Records) => {
        setMessage("Received updated records for Table 1");
        setTable1Records(updatedTable1Records);
      });

      // Listen for updates for Table 2
      connection.on("ReceiveTable2Update", (updatedTable2Records) => {
        setMessage("Received updated records for Table 2");
        setTable2Records(updatedTable2Records);
      });

      // Listen for incident updates
      connection.on("ReceiveIncidentUpdate", (updatedIncidents) => {
        console.log(updatedIncidents);
        setIncidentCounts(updatedIncidents);
      });
    });

    return () => {
      connection.stop();
    };
  }, []);

  const fetchTable1Records = async () => {
    const response = await axios.get("http://localhost:5223/api/Data/table1");
    setTable1Records(response.data);
  };

  const fetchTable2Records = async () => {
    const response = await axios.get("http://localhost:5223/api/Data/table2");
    setTable2Records(response.data);
  };

  const fetchIncidentCounts = async () => {
    const response = await axios.get("http://localhost:5223/api/Data/incidents/counts");
    setIncidentCounts(response.data); // Directly use the API response
  };

  return (
    <div className="App">
      <h1>Real-Time Records</h1>
      {message && <div className="update-message">{message}</div>}

      <h2>Table 1</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {table1Records.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.name}</td>
              <td>{record.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Table 2</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {table2Records.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.name}</td>
              <td>{record.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Incident Counts</h2>
      {incidentCounts ? (
        <div>
          <h3>Counts by Severity</h3>
          <ul>
            {incidentCounts.severityCounts.map((item) => (
              <li key={item.severity}>{item.severity}: {item.count}</li>
            ))}
          </ul>
          <h3>Total Outages</h3>
          <p>{incidentCounts.outageCount}</p>
        </div>
      ) : (
        <p>Loading incident counts...</p>
      )}
    </div>
  );
}

export default App;
