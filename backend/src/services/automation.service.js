const Device = require('../models/device.model');
const ActionLog = require('../models/actionLog.model');
const mqttService = require('./mqtt.service');
const { MODES } = require('../config/constants');

const checkAutomation = async (deviceId, incomingData) => {
    try {
        const device = await Device.findOne({ deviceId });
        if (!device) return;

        // 1. Cập nhật thời gian bơm (Để tính toán Safety)
        // Nếu bơm đang bật mà trong DB chưa ghi nhận start time -> Ghi vào
        if (incomingData.pump && !device.status.pumpStartTime) {
            device.status.pumpStartTime = new Date();
            await device.save();
        }
        // Nếu bơm tắt -> Reset start time
        else if (!incomingData.pump) {
            if (device.status.pumpStartTime) {
                device.status.pumpStartTime = null;
                await device.save();
            }
        }

        // Chỉ chạy logic Auto nếu mode là AUTO
        if (device.status.mode !== MODES.AUTO) return;

        const { soil, temp } = incomingData;
        const { soilThresholdMin, soilThresholdMax, tempLimit, maxPumpDuration } = device.config;

        // ====================================================
        // RULE 1: SAFETY CUTOFF (Bảo vệ phần cứng)
        // ====================================================
        if (incomingData.pump && device.status.pumpStartTime) {
            const minutesRunning = (new Date() - new Date(device.status.pumpStartTime)) / 60000;

            if (minutesRunning > maxPumpDuration) {
                console.error(`[EMERGENCY] ${deviceId}: Pump running too long (> ${maxPumpDuration} mins). Force OFF.`);

                // Gửi lệnh tắt khẩn cấp
                mqttService.sendCommand(deviceId, { cmd: 'pump', value: false });

                // Cập nhật cảnh báo
                await Device.updateOne({ deviceId }, {
                    'health.status': 'ERROR',
                    'health.message': 'Bơm chạy quá lâu! Có thể do rò rỉ nước hoặc cảm biến hỏng.'
                });
                return; // Dừng logic tại đây
            }
        }

        // ====================================================
        // RULE 2: LOGIC BẬT BƠM (Kết hợp Nhiệt độ)
        // ====================================================
        // Nếu đất khô VÀ bơm đang tắt
        if (soil < soilThresholdMin && !incomingData.pump) {

            // Check Sốc Nhiệt: Nếu trời quá nóng (VD: > 37 độ)
            if (temp > tempLimit) {
                console.log(`[SKIPPED] ${deviceId}: Đất khô nhưng trời quá nóng (${temp}°C). Chờ mát hơn.`);
                // Có thể gửi noti cho user biết là hệ thống đang hoãn tưới
                return;
            }

            console.log(`[AUTO] ${deviceId}: Soil ${soil}% < ${soilThresholdMin}% -> PUMP ON`);
            mqttService.sendCommand(deviceId, { cmd: 'pump', value: true });

            await ActionLog.create({
                deviceId, action: 'PUMP_ON', actor: 'SYSTEM',
                details: `Soil ${soil}% < Min, Temp ${temp}°C OK`
            });
        }

            // ====================================================
            // RULE 3: LOGIC TẮT BƠM (Tưới đẫm)
            // ====================================================
        // Chỉ tắt khi đất đã thực sự ướt (đạt Max), không tắt lừng khừng
        else if (soil >= soilThresholdMax && incomingData.pump) {
            console.log(`[AUTO] ${deviceId}: Soil ${soil}% >= ${soilThresholdMax}% -> PUMP OFF`);
            mqttService.sendCommand(deviceId, { cmd: 'pump', value: false });

            // Clear lỗi nếu có (vì hệ thống đã hoạt động lại bình thường)
            await Device.updateOne({ deviceId }, {
                'health.status': 'OK',
                'health.message': ''
            });

            await ActionLog.create({
                deviceId, action: 'PUMP_OFF', actor: 'SYSTEM',
                details: `Soil reached ${soil}%`
            });
        }

    } catch (error) {
        console.error(`[Automation Error] ${error.message}`);
    }
};

module.exports = { checkAutomation };