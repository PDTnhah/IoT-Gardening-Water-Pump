const express = require('express');
const router = express.Router();
const controller = require('../controllers/device.controller');

/**
 * @route   GET /api/devices
 * @desc    Lấy danh sách thiết bị
 */
router.get('/', controller.getAllDevices);

/**
 * @route   GET /api/devices/:id
 * @desc    Lấy chi tiết 1 thiết bị
 */
router.get('/:id', controller.getDeviceById);

/**
 * @route   POST /api/devices/:id/config
 * @desc    Update ngưỡng tưới
 */
router.post('/:id/config', controller.updateConfig);

module.exports = router;