import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';

function App() {
  const [table1Records, setTable1Records] = useState([]);
  const [table2Records, setTable2Records] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch initial data for both tables
    fetchTable1Records();
    fetchTable2Records();

    // Set up SignalR connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5223/dataHub", { withCredentials: true }) // SignalR hub URL
      .build();

    // connection = new signalR.HubConnectionBuilder()
    // .configureLogging(signalR.LogLevel.Debug)  // add this for diagnostic clues
    // .withUrl("http://localhost:5223/dataHub", {
    //   skipNegotiation: true,  // skipNegotiation as we specify WebSockets
    //   transport: signalR.HttpTransportType.WebSockets  // force WebSocket transport
    // })
    // .build();

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
        console.log(updatedTable2Records);
        setTable2Records(updatedTable2Records);
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
    </div>
  );
}

export default App;
