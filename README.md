# E-commerce Backend API

This is the backend API for the e-commerce application built with Node.js, Express, and MongoDB.

## Setup Instructions

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies: `npm install`
4. Create a `.env` file in the root of the server directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ecommerce
   SESSION_SECRET=your_session_secret
   ```
5. Create an `uploads` folder in the root of the server directory
6. Start the development server: `npm run dev`

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon
- `npm run data:import`: Import sample data into the database
- `npm run data:destroy`: Delete all data from the database

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product by ID
- `POST /api/products` - Create a product (Admin only)
- `PUT /api/products/:id` - Update a product (Admin only)
- `DELETE /api/products/:id` - Delete a product (Admin only)

### Users
- `POST /api/users` - Register a new user
- `POST /api/users/login` - Authenticate user & get session
- `POST /api/users/logout` - Logout user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get logged in user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Update order to paid
- `PUT /api/orders/:id/deliver` - Update order to delivered (Admin only)
- `GET /api/orders` - Get all orders (Admin only)

### Uploads
- `POST /api/upload` - Upload an image 