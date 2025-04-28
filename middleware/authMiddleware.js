const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Đảm bảo rằng có mật khẩu JWT bằng cách đặt cố định nếu không tìm thấy trong process.env
const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecretk3yshouldBeUpdatedInProduction123';
console.log('JWT_SECRET loaded:', JWT_SECRET ? 'YES (masked)' : 'NO');

const protect = async (req, res, next) => {
  try {
    console.log('protect middleware - Headers:', req.headers);
    
    // Kiểm tra xem người dùng đăng nhập qua session hay không
    if (req.session && req.session.userId) {
      console.log('protect middleware - Tìm thấy session userId:', req.session.userId);
      const user = await User.findById(req.session.userId).select('-password');
      
      if (user) {
        console.log('protect middleware - User từ session:', user._id);
        req.user = user;
        return next();
      }
    }
    
    // Kiểm tra JWT trong header Authorization
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        console.log('protect middleware - Tìm thấy Authorization header');
        // Lấy token từ header
        token = req.headers.authorization.split(' ')[1];
        console.log('protect middleware - Token:', token.substring(0, 20) + '...');
        
        // Kiểm tra JWT_SECRET
        console.log('protect middleware - Using JWT_SECRET for verification');
        
        // Giải mã token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('protect middleware - Decoded token:', decoded);
        
        // Tìm user theo id đã giải mã và bỏ password
        req.user = await User.findById(decoded.id).select('-password');
        console.log('protect middleware - User từ token:', req.user?._id);
        
        if (!req.user) {
          throw new Error('User not found with token ID');
        }
        
        return next();
      } catch (error) {
        console.error('protect middleware - Lỗi JWT:', error);
        res.status(401);
        throw new Error('Not authorized, token failed: ' + error.message);
      }
    }

    // Nếu không tìm thấy session hoặc token
    console.log('protect middleware - Không tìm thấy session hoặc token');
    res.status(401);
    throw new Error('Not authorized, no token or session');
  } catch (error) {
    console.error('protect middleware - Error:', error);
    res.status(401).json({ message: error.message });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin }; 