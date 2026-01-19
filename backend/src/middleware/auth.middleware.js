const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Lấy token từ header (Dạng: "Bearer <token>")
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Lấy phần sau chữ Bearer

    if (!token) {
        return res.status(401).json({ message: 'Truy cập bị từ chối! Vui lòng đăng nhập.' });
    }

    try {
        // 2. Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Gán thông tin user vào request để dùng ở Controller sau này
        req.user = decoded;

        next(); // Cho phép đi tiếp
    } catch (error) {
        console.error(error);
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

// (Tùy chọn) Middleware chỉ cho phép Admin
const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này!' });
        }
    });
};

module.exports = { verifyToken, verifyAdmin };