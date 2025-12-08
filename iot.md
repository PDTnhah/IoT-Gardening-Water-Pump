Dưới đây là bản thiết kế Hệ thống IoT Tưới Cây Thông Minh được trình bày theo đúng cấu trúc và phong cách của file online_learning_readme.md mà bạn đã cung cấp. Toàn bộ code và cấu trúc đã được chuyển sang JavaScript (bỏ TypeScript).

🌱 HỆ THỐNG IOT TƯỚI CÂY THÔNG MINH

Hệ thống giám sát và điều khiển tưới tiêu tự động thông qua Internet, sử dụng ESP32 và giao thức MQTT.

📋 MỤC LỤC

Tổng quan

Công nghệ sử dụng

Kiến trúc hệ thống

Các Module chính

Database Schema

API Endpoints

MQTT & Realtime Events

Cấu trúc thư mục

🎯 TỔNG QUAN

Hệ thống quản lý nông nghiệp thông minh với các tính năng:

✅ Giám sát thời gian thực - Nhiệt độ, độ ẩm không khí, độ ẩm đất.

✅ Tự động hóa (Auto Mode) - Tự tưới khi đất khô dựa trên ngưỡng cài đặt.

✅ Điều khiển thủ công (Manual Mode) - Bật/tắt bơm từ xa qua Web.

✅ Biểu đồ trực quan - Theo dõi lịch sử dữ liệu môi trường.

✅ Cảnh báo & Log - Ghi lại lịch sử hoạt động của bơm.

✅ Đồng bộ Real-time - Trạng thái thiết bị được cập nhật tức thì lên Web.

🛠 CÔNG NGHỆ SỬ DỤNG
Backend

Node.js - JavaScript runtime

Express.js - Web framework

MQTT.js - Client kết nối Broker

Socket.IO - Real-time communication (Server → Client)

Mongoose - ODM cho MongoDB

Frontend

Next.js - React Framework

TailwindCSS - Styling

Recharts - Vẽ biểu đồ

Socket.IO Client - Nhận dữ liệu realtime

Axios - HTTP client

Hardware & Protocol

ESP32 - Vi điều khiển

MQTT Broker - HiveMQ / Mosquitto

Sensors - DHT11 (Nhiệt/Ẩm), Cảm biến độ ẩm đất

Database

MongoDB - Lưu trữ NoSQL (Tối ưu cho JSON log)

🏗 KIẾN TRÚC HỆ THỐNG
code
Code
download
content_copy
expand_less
┌─────────────────────────────────────────────┐
│          PRESENTATION LAYER (Next.js)       │
│  - Dashboard giám sát (Biểu đồ, Gauge)      │
│  - Panel điều khiển (Nút bấm, Cài đặt)      │
│  - Socket.IO Client (Nhận update)           │
└───────────────────┬─────────────────────────┘
│ HTTP / WebSocket
┌───────────────────┴─────────────────────────┐
│        APPLICATION LAYER (Node.js)          │
│  ┌─────────────────────────────────────┐   │
│  │ REST API Server (Express)           │   │
│  │ - Lấy lịch sử dữ liệu               │   │
│  │ - Cấu hình thiết bị                 │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ MQTT Client Module                  │   │
│  │ - Subscribe: devices/+/data         │   │
│  │ - Publish: devices/+/command        │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Automation Logic Service            │   │
│  │ - So sánh: Đất < Ngưỡng -> Bơm ON   │   │
│  └─────────────────────────────────────┘   │
└───────────────────┬─────────────────────────┘
│
┌───────────────────┴─────────────────────────┐
│           DATA LAYER (MongoDB)              │
│  - Devices (Trạng thái, Cấu hình)           │
│  - SensorLogs (Dữ liệu theo thời gian)      │
│  - ActionLogs (Lịch sử bật/tắt)             │
└───────────────────┬─────────────────────────┘
│ MQTT Protocol
┌───────────────────┴─────────────────────────┐
│           PHYSICAL LAYER (ESP32)            │
│  - Cảm biến (Nhiệt, Ẩm, Đất)                │
│  - Relay (Máy bơm)                          │
└─────────────────────────────────────────────┘
📦 CÁC MODULE CHÍNH
1️⃣ MQTT Gateway Module 📡

Chức năng:

Kết nối tới MQTT Broker.

Lắng nghe topic devices/+/data và devices/+/status.

Gửi lệnh điều khiển xuống devices/+/command.

Xử lý Logic:

Parse dữ liệu JSON từ ESP32.

Gọi module Database để lưu trữ.

Gọi module Socket để bắn data ra Frontend ngay lập tức.

2️⃣ Automation & Logic Module 🤖

Chức năng:

"Bộ não" của hệ thống.

Chạy mỗi khi nhận được gói tin data mới.

Flow xử lý:

Nhận độ ẩm đất (soil) từ MQTT.

Kiểm tra chế độ: Nếu Mode == AUTO.

So sánh với Config.threshold:

Nếu soil < min ➔ Gửi lệnh BẬT bơm.

Nếu soil > max ➔ Gửi lệnh TẮT bơm.

3️⃣ Device Management Module 🎛️

Chức năng:

Quản lý danh sách thiết bị.

Lưu trữ trạng thái hiện tại (Snapshot state) để hiển thị nhanh.

Cài đặt ngưỡng tưới (Config).

Key Features:

Kiểm tra trạng thái Online/Offline (dựa trên lastSeen).

Đổi tên hiển thị thiết bị.

4️⃣ Data Logging & Analytics 📊

Chức năng:

Lưu trữ Time-series data (Nhiệt độ, Độ ẩm).

API cung cấp dữ liệu cho biểu đồ Line Chart.

API phân trang (Pagination) hoặc lọc theo ngày.

🗄 DATABASE SCHEMA
Device Schema (Lưu trạng thái & Cấu hình)
code
JavaScript
download
content_copy
expand_less
{
_id: ObjectId,
deviceId: String (unique, index), // VD: "esp32_001"
name: String,
status: {
temp: Number,
humidity: Number,
soil: Number,
pump: Boolean, // true: ON, false: OFF
mode: String,  // 'AUTO', 'MANUAL_ON', 'MANUAL_OFF'
lastSeen: Date
},
config: {
soilThresholdMin: Number, // Mặc định 30
soilThresholdMax: Number  // Mặc định 80
},
createdAt: Date,
updatedAt: Date
}
SensorLog Schema (Lưu lịch sử cảm biến)
code
JavaScript
download
content_copy
expand_less
{
_id: ObjectId,
deviceId: String (index),
temp: Number,
humidity: Number,
soil: Number,
createdAt: Date (index) // Time-series
}
ActionLog Schema (Lưu lịch sử thao tác)
code
JavaScript
download
content_copy
expand_less
{
_id: ObjectId,
deviceId: String,
action: String, // 'PUMP_ON', 'PUMP_OFF', 'CHANGE_MODE'
actor: String,  // 'SYSTEM' (Auto) hoặc 'USER' (Manual)
note: String,
createdAt: Date
}
🔌 API ENDPOINTS
Device Routes (/api/devices)
code
Code
download
content_copy
expand_less
GET    /                      - Lấy danh sách tất cả thiết bị
GET    /:id                   - Lấy chi tiết trạng thái thiết bị (Dashboard)
POST   /:id/config            - Cập nhật cấu hình ngưỡng tưới (Threshold)
Control Routes (/api/control)
code
Code
download
content_copy
expand_less
POST   /:id/mode              - Chuyển chế độ (Auto/Manual)
Body: { "mode": "auto" }
POST   /:id/pump              - Bật tắt bơm (Chỉ dùng khi cần can thiệp)
Body: { "pump": true }
Analytics Routes (/api/analytics)
code
Code
download
content_copy
expand_less
GET    /:id/logs              - Lấy dữ liệu vẽ biểu đồ (có query ?limit=50)
GET    /:id/history           - Lấy lịch sử đóng ngắt bơm
📡 MQTT & REALTIME EVENTS
MQTT Topics (Hardware ↔ Server)
Topic	Hướng	Payload Mẫu	Mô tả
devices/+/data	ESP32 → Server	{"soil": 80, "temp": 30}	Gửi chỉ số cảm biến
devices/+/status	ESP32 → Server	{"pump": true, "mode": "AUTO"}	Đồng bộ trạng thái
devices/+/command	Server → ESP32	{"cmd": "pump", "value": true}	Điều khiển thiết bị
Socket.IO Events (Server ↔ Frontend)

Namespace: /

code
JavaScript
download
content_copy
expand_less
// Server → Client (Cập nhật giao diện ngay lập tức)
"device:update"
// Data:
{
deviceId: "esp32_001",
temp: 30.5,
soil: 60,
pump: false
}
📁 CẤU TRÚC THƯ MỤC
Backend Structure (Node.js)
code
Code
download
content_copy
expand_less
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Kết nối MongoDB
│   │   ├── mqtt.js              # Cấu hình MQTT Broker
│   │   └── constants.js         # Các hằng số (Threshold mặc định)
│   │
│   ├── models/
│   │   ├── device.model.js      # Mongoose Schema Device
│   │   ├── sensorLog.model.js   # Mongoose Schema Logs
│   │   └── actionLog.model.js   # Mongoose Schema Action
│   │
│   ├── controllers/
│   │   ├── device.controller.js # Xử lý logic API Device
│   │   └── stats.controller.js  # Xử lý logic API Biểu đồ
│   │
│   ├── routes/
│   │   ├── device.routes.js     # Định tuyến API
│   │   └── stats.routes.js
│   │
│   ├── services/
│   │   ├── mqtt.service.js      # Xử lý Subscribe/Publish MQTT
│   │   ├── automation.service.js # Logic tự động tưới (So sánh Soil)
│   │   └── socket.service.js    # Quản lý Socket.IO
│   │
│   ├── app.js                   # Setup Express App
│   └── server.js                # Entry point (Khởi chạy Server, MQTT, Socket)
│
├── .env                         # Biến môi trường (DB URL, MQTT URL)
├── package.json
└── README.md
Frontend Structure (Next.js)
code
Code
download
content_copy
expand_less
frontend/
├── src/
│   ├── app/                     # App Router (Next.js 13+)
│   │   ├── page.js              # Trang chủ (Danh sách thiết bị)
│   │   ├── dashboard/
│   │   │   └── [id]/page.js     # Trang chi tiết thiết bị
│   │   └── layout.js
│   │
│   ├── components/
│   │   ├── charts/
│   │   │   ├── SensorChart.jsx  # Biểu đồ đường (Recharts)
│   │   │   └── GaugeChart.jsx   # Biểu đồ đồng hồ đo
│   │   │
│   │   ├── controls/
│   │   │   ├── ModeSwitch.jsx   # Nút gạt Auto/Manual
│   │   │   └── PumpButton.jsx   # Nút bật tắt bơm
│   │   │
│   │   └── common/
│   │       ├── Navbar.jsx
│   │       └── StatusCard.jsx   # Thẻ hiển thị Nhiệt/Ẩm
│   │
│   ├── hooks/
│   │   ├── useSocket.js         # Hook lắng nghe Socket realtime
│   │   └── useDeviceData.js     # Hook fetch API ban đầu
│   │
│   ├── services/
│   │   └── api.js               # Cấu hình Axios
│   │
│   ├── utils/
│   │   └── formatters.js        # Format ngày tháng, đơn vị
│   │
│   └── styles/
│       └── globals.css          # Tailwind directives
│
├── public/
├── .env.local
├── package.json
└── jsconfig.json