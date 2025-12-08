const mongoose = require('mongoose');
const { DEFAULT_CONFIG, MODES } = require('../config/constants');

const DeviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    name: {
        type: String,
        default: 'Vườn Thông Minh'
    },

    // Trạng thái hiện tại (Realtime Snapshot)
    status: {
        temp: { type: Number, default: 0 },
        humidity: { type: Number, default: 0 },
        soil: { type: Number, default: 0 },
        pump: { type: Boolean, default: false }, // true: ON, false: OFF
        mode: {
            type: String,
            enum: [MODES.AUTO, MODES.MANUAL_ON, MODES.MANUAL_OFF],
            default: MODES.AUTO
        },
        lastSeen: { type: Date, default: Date.now } // Để check Online/Offline
    },

    // Cấu hình ngưỡng tưới (Automation Logic)
    config: {
        soilThresholdMin: { type: Number, default: DEFAULT_CONFIG.SOIL_MIN },
        soilThresholdMax: { type: Number, default: DEFAULT_CONFIG.SOIL_MAX }
    }
}, {
    timestamps: true // Tự động tạo createdAt, updatedAt
});

module.exports = mongoose.model('Device', DeviceSchema);