const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public Routes (Ai cũng gọi được)
router.post('/register', controller.register);
router.post('/login', controller.login);

// Private Routes (Phải có Token)
router.get('/me', verifyToken, controller.getProfile);

module.exports = router;