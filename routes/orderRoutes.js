const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/cancel').put(protect, cancelOrder);

// Route kiểm tra - CHỈ SỬ DỤNG TRONG QUÁ TRÌNH PHÁT TRIỂN
router.get('/debug/all', async (req, res) => {
  try {
    const Order = require('../models/orderModel');
    const orders = await Order.find({});
    console.log('Tất cả đơn hàng:', orders);
    res.json({
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng debug:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 