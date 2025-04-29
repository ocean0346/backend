const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const allowedOrigins = ['https://frontend-vv96.onrender.com', 'http://localhost:3000'];
const app = express(); // <-- THÊM DÒNG NÀY
app.use(cors());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.options('*', cors());
// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  })
);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);

// Test route
app.get('/api', (req, res) => {
  res.send('API is running...');
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the eCommerce API. Use /api routes to access API endpoints.');
});

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});