const Device = require('../models/device.model');
const mqttService = require('../services/mqtt.service');
const ActionLog = require('../models/actionLog.model');

/**
 * @desc    Lấy danh sách tất cả thiết bị trong hệ thống
 * @route   GET /api/devices
 * @access  Public
 */
const getAllDevices = async (req, res) => {
    try {
        const devices = await Device.find();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Lấy thông tin chi tiết trạng thái hiện tại của một thiết bị
 * @route   GET /api/devices/:id
 * @access  Public
 * @params  {id} - Device ID
 */
const getDeviceById = async (req, res) => {
    try {
        const device = await Device.findOne({ deviceId: req.params.id });
        if (!device) return res.status(404).json({ message: 'Device not found' });
        res.json(device);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Cập nhật cấu hình ngưỡng tưới (Automation Config)
 * @route   POST /api/devices/:id/config
 * @access  Public
 * @params  {id} - Device ID
 * @body    {soilThresholdMin, soilThresholdMax} - Ngưỡng dưới và ngưỡng trên
 */
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

/**
 * @desc    Chuyển đổi chế độ hoạt động (Auto / Manual)
 * @route   POST /api/control/:id/mode
 * @access  Public
 * @params  {id} - Device ID
 * @body    {mode} - Giá trị: 'auto' | 'manual_on' | 'manual_off'
 */
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

/**
 * @desc    Bật hoặc Tắt máy bơm thủ công (Chỉ hoạt động khi ở chế độ Manual)
 * @route   POST /api/control/:id/pump
 * @access  Public
 * @params  {id} - Device ID
 * @body    {pump} - Boolean: true (Bật) | false (Tắt)
 */
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