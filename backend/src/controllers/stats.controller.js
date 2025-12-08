const SensorLog = require('../models/sensorLog.model');
const ActionLog = require('../models/actionLog.model');

// [GET] /api/analytics/:id/logs
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

// [GET] /api/analytics/:id/history
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