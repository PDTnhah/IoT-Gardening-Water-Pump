const Device = require('../models/device.model');
const mqttService = require('../services/mqtt.service');
const ActionLog = require('../models/actionLog.model');

// [GET] /api/devices
const getAllDevices = async (req, res) => {
    try {
        const devices = await Device.find();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/devices/:id
const getDeviceById = async (req, res) => {
    try {
        const device = await Device.findOne({ deviceId: req.params.id });
        if (!device) return res.status(404).json({ message: 'Device not found' });
        res.json(device);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/devices/:id/config
// Cập nhật ngưỡng tưới
const updateConfig = async (req, res) => {
    try {
        const { soilThresholdMin, soilThresholdMax } = req.body;
        const device = await Device.findOneAndUpdate(
            { deviceId: req.params.id },
            { $set: { config: { soilThresholdMin, soilThresholdMax } } },
            { new: true }
        );
        res.json(device);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/control/:id/mode
// Chuyển chế độ AUTO / MANUAL
const setMode = async (req, res) => {
    const { id } = req.params;
    const { mode } = req.body; // 'auto', 'manual_on', 'manual_off'

    try {
        // 1. Gửi lệnh MQTT
        mqttService.sendCommand(id, { cmd: 'mode', value: mode });

        // 2. Lưu Log
        await ActionLog.create({
            deviceId: id,
            action: 'CHANGE_MODE',
            actor: 'USER',
            details: `Mode changed to ${mode}`
        });

        // 3. Update DB (Optimistic)
        await Device.findOneAndUpdate(
            { deviceId: id },
            { $set: { 'status.mode': mode.toUpperCase() } }
        );

        res.json({ success: true, message: `Mode set to ${mode}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/control/:id/pump
// Bật tắt bơm thủ công
const togglePump = async (req, res) => {
    const { id } = req.params;
    const { pump } = req.body; // true / false

    try {
        mqttService.sendCommand(id, { cmd: 'pump', value: pump });

        await ActionLog.create({
            deviceId: id,
            action: pump ? 'PUMP_ON' : 'PUMP_OFF',
            actor: 'USER',
            details: 'Manual control via Web'
        });

        res.json({ success: true, message: `Pump ${pump ? 'ON' : 'OFF'} command sent` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllDevices,
    getDeviceById,
    updateConfig,
    setMode,
    togglePump
};