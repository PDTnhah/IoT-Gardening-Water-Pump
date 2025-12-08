const express = require('express');
const router = express.Router();
const controller = require('../controllers/stats.controller');

router.get('/:id/logs', controller.getSensorLogs);
router.get('/:id/history', controller.getActionHistory);

module.exports = router;