const mqtt = require('mqtt');
const mqttConfig = require('../config/mqtt');
const { TOPICS } = require('../config/constants');
const Device = require('../models/device.model');
const SensorLog = require('../models/sensorLog.model');
const socketService = require('./socket.service');
const automationService = require('./automation.service');

let client;

const connect = () => {
    client = mqtt.connect(mqttConfig.url, mqttConfig.options);

    console.log('here');

    client.on('connect', () => {
        console.log('Connected to MQTT Broker');
        // Subscribe các topic
        client.subscribe(TOPICS.SUBSCRIBE_DATA);
        client.subscribe(TOPICS.SUBSCRIBE_STATUS);
    });

    client.on('message', async (topic, message) => {
        try {
            const payload = JSON.parse(message.toString());
            const parts = topic.split('/'); // devices/esp32_001/data
            const deviceId = parts[1];
            const channel = parts[2];

            if (channel === 'data') {
                await handleDataMessage(deviceId, payload);
            } else if (channel === 'status') {
                await handleStatusMessage(deviceId, payload);
            }
        } catch (error) {
            console.error('MQTT Message Error:', error.message);
        }
    });
};

// Hàm gửi lệnh xuống ESP32
const sendCommand = (deviceId, commandObj) => {
    if (client && client.connected) {
        const topic = TOPICS.PUBLISH_COMMAND(deviceId);
        const message = JSON.stringify(commandObj);
        client.publish(topic, message);
        console.log(`Sent Command to ${topic}:`, message);
    } else {
        console.warn('MQTT Client not connected');
    }
};

// Xử lý khi nhận Data (Sensor)
const handleDataMessage = async (deviceId, data) => {
    // 1. Lưu vào SensorLog (Time-series)
    await SensorLog.create({
        deviceId,
        temp: data.temp,
        humidity: data.humidity,
        soil: data.soil
    });

    // 2. Cập nhật Status mới nhất vào Device Collection
    await Device.findOneAndUpdate(
        { deviceId },
        {
            $set: {
                'status.temp': data.temp,
                'status.humidity': data.humidity,
                'status.soil': data.soil,
                'status.pump': data.pump,
                'status.mode': data.mode, // Cập nhật mode nếu ESP32 gửi lên
                'status.lastSeen': new Date()
            }
        },
        { upsert: true, new: true } // Nếu chưa có device thì tạo mới
    );

    // 3. Gửi Realtime ra Frontend
    try {
        const io = socketService.getIO();
        io.emit('device:update', { deviceId, ...data });
    } catch (e) {}

    // 4. Chạy Logic Tự Động
    await automationService.checkAutomation(deviceId, data, sendCommand);
};

// Xử lý khi nhận Status (ESP32 phản hồi trạng thái)
const handleStatusMessage = async (deviceId, data) => {
    // Update DB
    await Device.findOneAndUpdate(
        { deviceId },
        {
            $set: {
                'status.pump': data.pump,
                'status.mode': data.mode,
                'status.lastSeen': new Date()
            }
        }
    );

    // Emit Socket
    try {
        const io = socketService.getIO();
        io.emit('device:update', { deviceId, ...data });
    } catch (e) {}
};

module.exports = { connect, sendCommand };