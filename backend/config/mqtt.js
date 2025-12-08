const mqtt = {
    url: process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com',
    options: {
        port: process.env.MQTT_PORT || 1883,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        clientId: `server_backend_${Math.random().toString(16).slice(3)}`,
        clean: true, // Xóa session cũ khi connect lại
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    }
};

module.exports = mqtt;