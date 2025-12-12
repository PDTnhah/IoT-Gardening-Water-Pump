const express = require('express');
const router = express.Router();
const controller = require('../controllers/device.controller');

/**
 * @route   POST /api/control/:id/mode
 * @desc    Chuyển chế độ Auto / Manual
 */
router.post('/:id/mode', controller.setMode);

/**
 * @route   POST /api/control/:id/pump
 * @desc    Điều khiển bật/tắt bơm (Manual)
 */
router.post('/:id/pump', controller.togglePump);

module.exports = router;