require('dotenv').config();
const mongoose = require('mongoose');

// Lấy email từ argument khi chạy script
const emailToCheck = process.argv[2];

if (!emailToCheck) {
  console.error('Vui lòng cung cấp email để kiểm tra. Ví dụ: node checkEmail.js example@gmail.com');
  process.exit(1);
}

const connectDB = async () => {
  try {
    console.log('Đang kết nối đến MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB đã kết nối: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Lỗi kết nối đến MongoDB: ${error.message}`);
    return false;
  }
};

const checkEmail = async (email) => {
  try {
    // Import mô hình User
    const User = require('./models/userModel');

    console.log(`Đang tìm kiếm người dùng với email: ${email}`);
    
    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    
    if (user) {
      console.log(`✅ TÌM THẤY người dùng với email ${email}:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Tên: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Admin: ${user.isAdmin}`);
      console.log(`   Ngày tạo: ${user.createdAt}`);
      return true;
    } else {
      console.log(`❌ KHÔNG TÌM THẤY người dùng với email: ${email}`);
      return false;
    }
  } catch (error) {
    console.error(`Lỗi khi kiểm tra email: ${error.message}`);
    return false;
  }
};

// Thực thi kiểm tra
const main = async () => {
  const connected = await connectDB();
  
  if (connected) {
    await checkEmail(emailToCheck);
    // Đóng kết nối khi hoàn thành
    mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
  }
};

main(); 