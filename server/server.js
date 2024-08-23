const express = require("express");
const cors = require("cors");
const { OPCUAClient } = require("node-opcua");

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

const endpointUrl = "opc.tcp://192.168.1.41:102"; // Fill in with the IP and port of your PLC
let client;
let session;

// Endpoint to get data
app.get("/data", async (req, res) => {
  if (!session) {
    return res.status(400).json({ success: false, message: "Not connected" });
  }

  try {
    const dataValue = await session.readVariableValue("ns=1;s=MyVariable"); // Replace with your Node ID
    res.json({ success: true, data: dataValue.value.value });
  } catch (err) {
    console.error("Error reading data:", err);
    res.status(500).json({ success: false, message: "Error reading data" });
  }
});

// Endpoint for connecting
app.get("/connect", async (req, res) => {
  if (client) {
    return res
      .status(400)
      .json({ success: false, message: "Already connected" });
  }

  client = OPCUAClient.create({ endpointUrl: endpointUrl });

  try {
    const connectPromise = client.connect(endpointUrl);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Connection timeout after 5 seconds")),
        5000
      );
    });

    await Promise.race([connectPromise, timeoutPromise]);
    session = await client.createSession();
    res.json({ success: true, message: "Connected to the PLC." });
  } catch (err) {
    console.error("Error connecting to the server:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Endpoint for disconnecting
app.get("/disconnect", async (req, res) => {
  try {
    if (session) {
      await session.close();
      session = null;
    }
    if (client) {
      await client.disconnect();
      client = null;
    }
    res.json({ success: true, message: "Disconnected" });
  } catch (err) {
    console.error("Error disconnecting from the server:", err);
    res
      .status(500)
      .json({ success: false, message: "Error disconnecting from the server" });
  }
});

// Starting the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
