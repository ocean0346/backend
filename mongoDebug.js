require('dotenv').config();
const mongoose = require('mongoose');

// Hiển thị thông tin chuỗi kết nối
console.log('MONGO_URI từ .env file:', process.env.MONGO_URI);

const connectDB = async () => {
  try {
    console.log('Đang kết nối đến MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB đã kết nối: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`Tên database: ${conn.connection.name}`);
    
    // Lấy danh sách tất cả collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nDanh sách collections trong database:');
    if (collections.length === 0) {
      console.log('- Không có collection nào');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    // Kiểm tra collection 'users'
    const usersCollection = collections.find(c => c.name === 'users');
    if (usersCollection) {
      console.log('\nTìm thấy collection users:');
      
      // Đếm số lượng documents trong users collection
      const userCount = await mongoose.connection.db.collection('users').countDocuments();
      console.log(`- Số lượng người dùng: ${userCount}`);
      
      if (userCount > 0) {
        // Liệt kê tất cả users
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('\nDanh sách người dùng:');
        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name} (${user.email})`);
        });
      }
    } else {
      console.log('\nKhông tìm thấy collection users');
      console.log('=> Có thể collection chưa được tạo, hoặc đang kết nối sai database');
    }
    
    return true;
  } catch (error) {
    console.error(`Lỗi kết nối đến MongoDB: ${error.message}`);
    return false;
  }
};

// Thực thi kiểm tra
const main = async () => {
  const connected = await connectDB();
  
  if (connected) {
    // Đóng kết nối khi hoàn thành
    mongoose.connection.close();
    console.log('\nĐã đóng kết nối MongoDB');
  }
};

main(); 