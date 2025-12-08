const mongoose = require('mongoose');

const SensorLogSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        index: true // Index để query theo thiết bị nhanh hơn
    },
    temp: { type: Number, required: true },
    humidity: { type: Number, required: true },
    soil: { type: Number, required: true },

    // Thời gian ghi log
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Index để query range thời gian vẽ biểu đồ nhanh
    }
}, {
    timestamps: false // Không cần updatedAt cho log
});

module.exports = mongoose.model('SensorLog', SensorLogSchema);