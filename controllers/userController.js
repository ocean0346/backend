const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Đảm bảo rằng có mật khẩu JWT bằng cách đặt cố định nếu không tìm thấy trong process.env
const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecretk3yshouldBeUpdatedInProduction123';

// Tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get session
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res, next) => {
  try {
    console.log('Auth user request:', { ...req.body, password: '***' });
    
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      console.log('User authenticated:', user._id);
      
      // Set user in session
      req.session.userId = user._id;
      
      // Tạo token
      const token = generateToken(user._id);
      console.log('Generated token:', token.substring(0, 20) + '...');
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: token,
      });
    } else {
      console.log('Authentication failed for email:', email);
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    console.log('===== BẮT ĐẦU ĐĂNG KÝ NGƯỜI DÙNG =====');
    console.log('Nhận yêu cầu đăng ký:', { ...req.body, password: '***' });
    
    const { name, email, password } = req.body;

    console.log('Kiểm tra email đã tồn tại:', email);
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('Email đã tồn tại:', email);
      res.status(400);
      throw new Error('User already exists');
    }

    console.log('Tạo người dùng mới với thông tin:', { name, email, password: '***' });
    try {
      const user = await User.create({
        name,
        email,
        password,
      });

      console.log('Kết quả tạo user từ MongoDB:', user ? {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      } : 'không có dữ liệu');

      if (user) {
        // Set user in session
        req.session.userId = user._id;
        console.log('Đăng ký thành công, ID:', user._id);
        
        // Tạo token
        const token = generateToken(user._id);
        console.log('Generated token:', token.substring(0, 20) + '...');
        
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: token,
        });
      } else {
        console.log('Tạo người dùng thất bại - không có data trả về');
        res.status(400);
        throw new Error('Invalid user data');
      }
    } catch (dbError) {
      console.error('LỖI KHI TẠO USER TRONG DATABASE:', dbError);
      res.status(500);
      throw dbError;
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error.message);
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear session
// @route   POST /api/users/logout
// @access  Private
const logoutUser = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      const error = new Error('Could not log out');
      res.status(500);
      return next(error);
    }
    res.json({ message: 'Logged out successfully' });
  });
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  getUsers,
  deleteUser,
}; 