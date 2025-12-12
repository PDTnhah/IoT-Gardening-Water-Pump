const SensorLog = require('../models/sensorLog.model');
const ActionLog = require('../models/actionLog.model');

/**
 * @desc    Lấy lịch sử dữ liệu cảm biến (Sensor Data) để vẽ biểu đồ
 * @route   GET /api/analytics/:id/logs
 * @access  Public
 * @params  {id} - Device ID
 * @query   {limit} - Số lượng bản ghi muốn lấy (Mặc định 20)
 */
const getSensorLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const logs = await SensorLog.find({ deviceId: req.params.id })
            .sort({ createdAt: -1 }) // Lấy mới nhất
            .limit(limit);

        // Đảo ngược lại để Frontend vẽ từ trái sang phải (cũ -> mới)
        res.json(logs.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Lấy lịch sử hoạt động/thao tác (Bật tắt bơm, đổi chế độ)
 * @route   GET /api/analytics/:id/history
 * @access  Public
 * @params  {id} - Device ID
 * @query   {limit} - Số lượng bản ghi (Mặc định 10)
 */
const getActionHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const logs = await ActionLog.find({ deviceId: req.params.id })
            .sort({ createdAt: -1 })
            .limit(limit);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSensorLogs, getActionHistory };