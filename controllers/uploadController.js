const path = require('path');

// @desc    Upload file
// @route   POST /api/upload
// @access  Private
const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Tạo đường dẫn tương đối để client có thể truy cập ảnh
    const filePath = req.file.path.replace(/\\/g, '/');
    const relativePath = `/uploads/${path.basename(filePath)}`;
    
    res.json({
      message: 'File uploaded successfully',
      fileName: req.file.filename,
      filePath: relativePath,
      imagePath: relativePath, // Thêm trường imagePath để phù hợp với client
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
};

module.exports = { uploadFile }; 