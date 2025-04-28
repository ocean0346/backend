const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // Log lỗi cho mục đích debug
  console.error(`Error Stack: ${err.stack}`);
  console.error(`Error Path: ${req.originalUrl}`);
  console.error(`Request Body: ${JSON.stringify({ ...req.body, password: '***' })}`);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.log('Trả về lỗi với mã:', statusCode, 'và thông điệp:', err.message);
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler }; 