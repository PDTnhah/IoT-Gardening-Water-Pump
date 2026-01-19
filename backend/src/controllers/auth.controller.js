const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Hàm helper để tạo Token
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Token hết hạn sau 1 ngày
    );
};

// [POST] /api/auth/register
const register = async (req, res) => {
    try {
        const { username, password, fullName } = req.body;

        // 1. Kiểm tra user tồn tại
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

        // 2. Tạo user mới (Password sẽ tự động được mã hóa nhờ Model hook)
        const newUser = await User.create({
            username,
            password,
            fullName
        });

        // 3. Trả về kết quả (không trả về password)
        res.status(201).json({
            message: 'Đăng ký thành công',
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [POST] /api/auth/login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Tìm user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
        }

        // 2. Kiểm tra mật khẩu
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
        }

        // 3. Tạo Token
        const token = generateAccessToken(user);

        // 4. Trả về token và thông tin user
        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user._id,
                username: user.username,
                fullName: user.fullName,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [GET] /api/auth/me (Lấy thông tin profile từ token)
const getProfile = async (req, res) => {
    try {
        // req.user.id có được từ middleware verifyToken
        const user = await User.findById(req.user.id).select('-password'); // Trừ trường password ra
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login, getProfile };