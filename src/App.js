import React, { useState } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:4000/data");
      setData(response.data);
    } catch (error) {
      console.error(
        "Error fetching data:",
        error.response?.data?.message || error.message
      );
    }
  };

  const connect = async () => {
    try {
      const response = await axios.get("http://localhost:4000/connect");
      if (response.data.success) {
        setIsConnected(true);
        console.log("Connected to the server");
      } else {
        console.error("Failed to connect to server:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Error connecting to server:",
        error.response?.data?.message || error.message
      );
    }
  };

  const disconnect = async () => {
    try {
      const response = await axios.get("http://localhost:4000/disconnect");
      if (response.data.success) {
        setIsConnected(false);
        console.log("Disconnected from the server");
      } else {
        console.error(
          "Failed to disconnect from server:",
          response.data.message
        );
      }
    } catch (error) {
      console.error("Error disconnecting from server:", error.message);
    }
  };

  return (
    <div>
      <h1>PLC Data</h1>
      <button onClick={connect} disabled={isConnected}>
        Connect
      </button>
      <button onClick={disconnect} disabled={!isConnected}>
        Disconnect
      </button>
      <button onClick={fetchData} disabled={!isConnected}>
        Fetch Data
      </button>
      {data && <p>Data from PLC: {JSON.stringify(data)}</p>}
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
    </div>
  );
}

export default App;
