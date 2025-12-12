const mqtt = {
    url: "mqtts://28f49484412341f9a4480874c05255d3.s1.eu.hivemq.cloud:8883",
    options: {
        username: "Admin123",
        password: "Admin123",
        clientId: `server_backend_${Math.random().toString(16).slice(3)}`,
        clean: true, // Xóa session cũ khi connect lại
        connectTimeout: 4000,
        reconnectPeriod: 1000,
        rejectUnauthorized : false
    }
};

module.exports = mqtt;