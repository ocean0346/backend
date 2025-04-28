const Order = require('../models/orderModel');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    console.log('addOrderItems - Dữ liệu từ client:', req.body);
    console.log('addOrderItems - User ID từ request:', req.user._id);
    
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    } else {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        totalPrice,
      });

      console.log('addOrderItems - Đơn hàng trước khi lưu:', JSON.stringify(order));
      const createdOrder = await order.save();
      console.log('addOrderItems - Đơn hàng đã lưu:', JSON.stringify(createdOrder));

      res.status(201).json(createdOrder);
    }
  } catch (error) {
    console.error('addOrderItems - Lỗi:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();

      const updatedOrder = await order.save();

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();

      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Đơn hàng không tồn tại');
    }

    // Kiểm tra xem người dùng có quyền hủy đơn hàng hay không
    // Chỉ cho phép admin hoặc chủ đơn hàng hủy
    if (!req.user.isAdmin && order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Bạn không có quyền hủy đơn hàng này');
    }

    // Kiểm tra trạng thái đơn hàng
    if (order.isDelivered) {
      res.status(400);
      throw new Error('Không thể hủy đơn hàng đã giao');
    }

    // Cập nhật trạng thái hủy đơn hàng
    order.isCancelled = true;
    order.cancelledAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    console.log('getMyOrders - User ID:', req.user._id);
    console.log('getMyOrders - User Info:', req.user);
    
    const orders = await Order.find({ user: req.user._id });
    console.log('getMyOrders - Đã tìm thấy đơn hàng:', orders.length);
    
    res.json(orders);
  } catch (error) {
    console.error('getMyOrders - Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  cancelOrder,
}; 