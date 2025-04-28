require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Đang kết nối đến MongoDB...', process.env.MONGO_URI || 'MONGO_URI không được cài đặt');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB đã kết nối: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Lỗi kết nối đến MongoDB: ${error.message}`);
    return false;
  }
};

const checkUsers = async () => {
  try {
    // Import mô hình User
    const User = require('./models/userModel');

    // Lấy tất cả người dùng từ DB
    const users = await User.find({});
    console.log(`Tìm thấy ${users.length} người dùng trong cơ sở dữ liệu:`);
    
    // Hiển thị thông tin người dùng (không hiển thị mật khẩu)
    users.forEach((user, index) => {
      console.log(`${index + 1}. Người dùng [${user._id}]:`);
      console.log(`   Tên: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Admin: ${user.isAdmin}`);
      console.log(`   Ngày tạo: ${user.createdAt}`);
      console.log('------------------------');
    });
  } catch (error) {
    console.error(`Lỗi khi kiểm tra users: ${error.message}`);
  }
};

// Thực thi kiểm tra
const main = async () => {
  const connected = await connectDB();
  
  if (connected) {
    await checkUsers();
    // Đóng kết nối khi hoàn thành
    mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
  }
};

main(); 