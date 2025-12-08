module.exports = {
    // MQTT Topics Patterns
    TOPICS: {
        SUBSCRIBE_DATA: 'devices/+/data',    // Nhận dữ liệu cảm biến
        SUBSCRIBE_STATUS: 'devices/+/status', // Nhận trạng thái status
        PUBLISH_COMMAND: (deviceId) => `devices/${deviceId}/command`, // Gửi lệnh
    },

    // Default Thresholds (Nếu thiết bị mới chưa có config)
    DEFAULT_CONFIG: {
        SOIL_MIN: 30, // Dưới 30% là khô -> Tưới
        SOIL_MAX: 80, // Trên 80% là ướt -> Dừng
    },

    // Device Modes
    MODES: {
        AUTO: 'AUTO',
        MANUAL_ON: 'MANUAL_ON',
        MANUAL_OFF: 'MANUAL_OFF',
    }
};