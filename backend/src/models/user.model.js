const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Không được trùng tên đăng nhập
        trim: true,
        minlength: 3
    },
    fullName: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user' // Mặc định đăng ký là user thường
    }
}, { timestamps: true });

// --- MIDDLEWARE: MÃ HÓA MẬT KHẨU TRƯỚC KHI LƯU ---
UserSchema.pre('save', async function() {
    // 1. Nếu mật khẩu không bị sửa đổi, return luôn (không làm gì cả)
    if (!this.isModified('password')) return;

    try {
        // 2. Tạo salt và hash
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        // 3. Kết thúc hàm, Mongoose tự hiểu là đã xong vì đây là async function
    } catch (error) {
        // Nếu có lỗi, throw ra để Mongoose bắt
        throw new Error(error);
    }
});


// --- METHOD: KIỂM TRA MẬT KHẨU ĐĂNG NHẬP ---
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);