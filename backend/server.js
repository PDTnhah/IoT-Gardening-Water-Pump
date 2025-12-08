require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/database');
const mqttService = require('./services/mqtt.service');
const socketService = require('./services/socket.service');

// Import Routes
const deviceRoutes = require('./routes/device.routes');
const controlRoutes = require('./routes/control.routes');
const statsRoutes = require('./routes/stats.routes');

// Init App
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Init Services
const io = socketService.init(server); // Khởi tạo Socket.io
mqttService.connect(); // Khởi tạo MQTT

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/control', controlRoutes);
app.use('/api/analytics', statsRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('🌱 Smart Garden IoT API is Running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});