const express = require('express');
const router = express.Router();
const controller = require('../controllers/stats.controller');

/**
 * @route   GET /api/analytics/:id/logs
 * @desc    Lấy log cảm biến (Temp, Humidity, Soil) cho biểu đồ
 */
router.get('/:id/logs', controller.getSensorLogs);

/**
 * @route   GET /api/analytics/:id/history
 * @desc    Lấy lịch sử hành động (Bật/tắt bơm, log hệ thống)
 */
router.get('/:id/history', controller.getActionHistory);

module.exports = router;