const express = require('express');
const router = express.Router();
const controller = require('../controllers/device.controller');

router.post('/:id/mode', controller.setMode);
router.post('/:id/pump', controller.togglePump);

module.exports = router;