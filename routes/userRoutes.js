const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  getUsers,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', protect, logoutUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/:id').delete(protect, admin, deleteUser);

// Route debug - Kiểm tra user có tồn tại theo email
router.get('/check/:email', async (req, res) => {
  try {
    const User = require('../models/userModel');
    const email = req.params.email;
    console.log('Kiểm tra tồn tại email:', email);
    const user = await User.findOne({ email });
    if (user) {
      res.json({
        exists: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt
        }
      });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 