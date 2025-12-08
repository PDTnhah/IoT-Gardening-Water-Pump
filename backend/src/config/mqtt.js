const mqtt = {
    url: "mqtts://28f4948412341f9a4480874c05255d3.s1.eu.hivemq.cloud:8883",
    options: {
        username: "Pham_Duy_Thanh_20225158",
        password: "Pham_Duy_Thanh_20225158",
        clientId: `server_backend_${Math.random().toString(16).slice(3)}`,
        clean: true, // Xóa session cũ khi connect lại
        connectTimeout: 4000,
        reconnectPeriod: 1000,
        rejectUnauthorized : false
    }
};

module.exports = mqtt;