// routes/orderRoutes.js

const router = require("express").Router();

const {
  createOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

const { protect, admin } = require("../middlewares/authMiddleware");


// Create order
router.post(
  "/create",
  protect,
  createOrder
);


// Get logged-in user orders
router.get(
  "/my-orders",
  protect,
  getMyOrders
);


// Get single order
router.get(
  "/:id",
  protect,
  getSingleOrder
);


// Admin - get all orders
router.get(
  "/admin/all",
  protect,
  admin,
  getAllOrders
);


// Admin - update order status
router.put(
  "/status/:id",
  protect,
  admin,
  updateOrderStatus
);


// Cancel order
router.put(
  "/cancel/:id",
  protect,
  cancelOrder
);


module.exports = router;