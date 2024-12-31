// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// Setup Express
const app = express();
app.use(cors());
app.use(bodyParser.json()); // Parse JSON bodies

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const io = socketIo(server);

// WebSocket Communication
io.on('connection', (socket) => {
  console.log('A client connected via WebSocket');
  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Routes
app.get('/api', (req, res) => {
  res.send({ message: 'Arduino Sensor API is working!' });
});

// Endpoint to receive data from ESP32
app.post('/sensor-data', (req, res) => {
  const { windSpeed, voltage, current, power } = req.body;

  // Log received data
  console.log('Received data from ESP32:', { windSpeed, voltage, current, power });

  // Emit the data to the frontend via WebSocket
  io.emit('sensor-data', { windSpeed, voltage, current, power });

  // Send a response back to the ESP32
  res.status(200).send({ message: 'Data received successfully' });
});

// Serve static files
app.use(express.static('public'));

// Start the Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
