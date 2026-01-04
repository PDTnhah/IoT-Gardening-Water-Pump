const mongoose = require('mongoose');
const { MODES } = require('../config/constants');

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

    // Trạng thái Realtime
    status: {
        temp: { type: Number, default: 0 },
        humidity: { type: Number, default: 0 },
        soil: { type: Number, default: 0 },
        pump: { type: Boolean, default: false },
        mode: { type: String, enum: Object.values(MODES), default: MODES.AUTO },
        lastSeen: { type: Date, default: Date.now },

        // Theo dõi thời gian bơm để phát hiện lỗi
        pumpStartTime: { type: Date, default: null },
    },

    // Hệ thống cảnh báo sức khỏe thiết bị
    health: {
        status: { type: String, enum: ['OK', 'WARNING', 'ERROR'], default: 'OK' },
        message: { type: String, default: '' } // VD: "Bơm chạy nhưng đất không ẩm!"
    },

    // Cấu hình nâng cao
    config: {
        soilThresholdMin: { type: Number, default: 30 }, // Dưới mức này thì tưới
        soilThresholdMax: { type: Number, default: 80 }, // Đủ mức này thì dừng

        // Bảo vệ cây
        tempLimit: { type: Number, default: 37 }, // Quá nóng -> Không tưới (tránh sốc nhiệt)

        // Bảo vệ phần cứng
        maxPumpDuration: { type: Number, default: 15 }, // Phút. Nếu bơm chạy quá lâu -> Tự ngắt (tránh tràn/cháy bơm)
    }
}, { timestamps: true });

module.exports = mongoose.model('Device', DeviceSchema);