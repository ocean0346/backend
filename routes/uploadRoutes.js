const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Single file upload route
router.post('/', upload.single('image'), uploadFile);

module.exports = router; 