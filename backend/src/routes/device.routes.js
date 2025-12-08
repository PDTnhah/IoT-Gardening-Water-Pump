const express = require('express');
const router = express.Router();
const controller = require('../controllers/device.controller');

router.get('/', controller.getAllDevices);
router.get('/:id', controller.getDeviceById);
router.post('/:id/config', controller.updateConfig);

module.exports = router;