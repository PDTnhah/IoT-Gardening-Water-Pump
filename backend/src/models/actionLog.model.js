const mongoose = require('mongoose');

const ActionLogSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        // Ví dụ: 'PUMP_ON', 'PUMP_OFF', 'MODE_CHANGE', 'CONFIG_UPDATE'
    },
    actor: {
        type: String,
        enum: ['SYSTEM', 'USER'], // SYSTEM: Auto mode làm, USER: Bấm nút trên web
        default: 'SYSTEM'
    },
    details: {
        type: String, // Ghi chú thêm (VD: "Đất khô 20% < 30%")
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

module.exports = mongoose.model('ActionLog', ActionLogSchema);