const SensorLog = require('../models/sensorLog.model');
const ActionLog = require('../models/actionLog.model');
const Device = require('../models/device.model');

/**
 * Phân tích sức khỏe hệ thống từ dữ liệu quá khứ
 * Trả về các cảnh báo thông minh
 */
const analyzeDeviceHealth = async (deviceId) => {
    const insights = [];

    // Lấy dữ liệu 1 giờ qua
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const logs = await SensorLog.find({ deviceId, createdAt: { $gte: oneHourAgo } }).sort({ createdAt: 1 });
    const actions = await ActionLog.find({ deviceId, createdAt: { $gte: oneHourAgo }, action: 'PUMP_ON' });

    if (logs.length === 0) return ["Không có dữ liệu để phân tích."];

    // INSIGHT 1: PHÁT HIỆN BƠM HỎNG / HẾT NƯỚC
    // Logic: Nếu có lệnh Bật Bơm, mà sau 10 phút độ ẩm không tăng -> Lỗi
    if (actions.length > 0) {
        const lastPumpOn = actions[actions.length - 1];
        // Lấy log sau khi bơm bật
        const logsAfterPump = logs.filter(l => l.createdAt > lastPumpOn.createdAt);

        if (logsAfterPump.length > 5) {
            const startSoil = logsAfterPump[0].soil;
            const endSoil = logsAfterPump[logsAfterPump.length - 1].soil;

            // Nếu độ ẩm không tăng (hoặc tăng quá ít < 5%) sau khi bơm
            if (endSoil - startSoil < 5) {
                insights.push({
                    type: 'CRITICAL',
                    msg: 'Cảnh báo: Máy bơm đã hoạt động nhưng độ ẩm không tăng. Có thể hết nước hoặc vòi tắc!'
                });
            } else {
                insights.push({
                    type: 'INFO',
                    msg: 'Hệ thống bơm hoạt động tốt, độ ẩm phản hồi nhanh.'
                });
            }
        }
    }

    // INSIGHT 2: PHÁT HIỆN ĐẤT KÉM CHẤT LƯỢNG (GIỮ NƯỚC KÉM)
    // Logic: Tính tốc độ giảm độ ẩm
    // Lấy 2 điểm dữ liệu cách nhau 30p lúc bơm tắt
    const logsPumpOff = logs.filter(l => l.soil > 50); // Chỉ xét lúc đất đang ẩm
    if (logsPumpOff.length > 10) {
        const dropRate = (logsPumpOff[0].soil - logsPumpOff[logsPumpOff.length-1].soil);
        if (dropRate > 20) { // Giảm 20% trong 1 giờ
            insights.push({
                type: 'WARNING',
                msg: 'Đất giữ nước kém (khô quá nhanh). Cân nhắc bón thêm xơ dừa hoặc đất thịt.'
            });
        }
    }

    // INSIGHT 3: CẢNH BÁO SỐC NHIỆT
    const maxTemp = Math.max(...logs.map(l => l.temp));
    if (maxTemp > 38) {
        insights.push({
            type: 'WARNING',
            msg: `Nhiệt độ môi trường rất cao (${maxTemp}°C). Hệ thống sẽ tự động hoãn tưới trưa để bảo vệ rễ.`
        });
    }

    return insights;
};

module.exports = { analyzeDeviceHealth };