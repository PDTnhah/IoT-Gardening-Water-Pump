const Device = require('../models/device.model');
const ActionLog = require('../models/actionLog.model');
const { MODES } = require('../config/constants');

/**
 * Kiểm tra logic tự động
 * @param {Object} deviceData - Dữ liệu mới nhất từ MQTT { soil, temp... }
 * @param {String} deviceId
 * @param {Function} sendCommandCallback - Hàm để gửi lệnh MQTT ngược lại
 */
const checkAutomation = async (deviceId, deviceData, sendCommandCallback) => {
    try {
        // 1. Lấy cấu hình thiết bị từ DB
        const device = await Device.findOne({ deviceId });
        if (!device) return;

        const currentMode = device.status.mode || MODES.AUTO;
        const isPumpOn = deviceData.pump; // Trạng thái bơm hiện tại từ cảm biến gửi lên
        const currentSoil = deviceData.soil;

        // Chỉ chạy logic nếu đang ở chế độ AUTO
        if (currentMode === MODES.AUTO) {
            const { soilThresholdMin, soilThresholdMax } = device.config;

            // Logic 1: Đất quá khô -> Bật bơm
            if (currentSoil < soilThresholdMin && !isPumpOn) {
                console.log(`[AUTO] ${deviceId}: Soil ${currentSoil}% < ${soilThresholdMin}% -> ON PUMP`);

                // Gửi lệnh MQTT
                sendCommandCallback(deviceId, { cmd: 'pump', value: true });

                // Lưu Log hành động
                await ActionLog.create({
                    deviceId,
                    action: 'PUMP_ON',
                    actor: 'SYSTEM',
                    details: `Soil ${currentSoil}% < Min ${soilThresholdMin}%`
                });
            }

            // Logic 2: Đất đã đủ ẩm -> Tắt bơm
            else if (currentSoil > soilThresholdMax && isPumpOn) {
                console.log(`[AUTO] ${deviceId}: Soil ${currentSoil}% > ${soilThresholdMax}% -> OFF PUMP`);

                // Gửi lệnh MQTT
                sendCommandCallback(deviceId, { cmd: 'pump', value: false });

                // Lưu Log hành động
                await ActionLog.create({
                    deviceId,
                    action: 'PUMP_OFF',
                    actor: 'SYSTEM',
                    details: `Soil ${currentSoil}% > Max ${soilThresholdMax}%`
                });
            }
        }
    } catch (error) {
        console.error(`[Automation Error] ${error.message}`);
    }
};

module.exports = { checkAutomation };