require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Thông tin người dùng mới
const newUser = {
  name: 'Admin Test',
  email: 'admin@test.com',
  password: 'admin123',
  isAdmin: true
};

// Kết nối đến MongoDB
const connectDB = async () => {
  try {
    console.log('Đang kết nối đến MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB đã kết nối: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Lỗi kết nối đến MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Hàm tạo người dùng mới
const createUser = async () => {
  try {
    await connectDB();
    
    // Kiểm tra xem collection users đã tồn tại chưa, nếu chưa thì tạo mới
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Collections hiện có:', collectionNames);
    
    // Tạo model User trực tiếp
    const userSchema = new mongoose.Schema(
      {
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
          unique: true,
        },
        password: {
          type: String,
          required: true,
        },
        isAdmin: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
      {
        timestamps: true,
      }
    );
    
    // Mã hóa mật khẩu trước khi lưu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);
    
    // Tạo người dùng mới trực tiếp trong collection
    const result = await mongoose.connection.db.collection('users').insertOne({
      name: newUser.name,
      email: newUser.email,
      password: hashedPassword,
      isAdmin: newUser.isAdmin,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`Người dùng mới đã được tạo với ID: ${result.insertedId}`);
    
    // Kiểm tra người dùng vừa tạo
    const createdUser = await mongoose.connection.db.collection('users').findOne({ _id: result.insertedId });
    console.log('Thông tin người dùng:', {
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      isAdmin: createdUser.isAdmin,
      createdAt: createdUser.createdAt
    });
    
    // Đóng kết nối
    await mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
    
    return createdUser;
  } catch (error) {
    console.error('Lỗi khi tạo người dùng mới:', error);
    
    // Đóng kết nối khi có lỗi
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Đã đóng kết nối MongoDB sau lỗi');
    }
    
    process.exit(1);
  }
};

// Thực thi
createUser(); 