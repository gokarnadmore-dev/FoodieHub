// routes/adminRoutes.js

const router = require("express").Router();

const {
  adminLogin,
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  deleteUser,
} = require("../controllers/adminController");

const { protect, admin } = require("../middlewares/authMiddleware");


// Admin Login
router.post("/login", adminLogin);


// Get all users
router.get(
  "/users",
  protect,
  admin,
  getAllUsers
);


// Delete user
router.delete(
  "/user/:id",
  protect,
  admin,
  deleteUser
);


// Get all orders
router.get(
  "/orders",
  protect,
  admin,
  getAllOrders
);


// Update order status
router.put(
  "/order/:id/status",
  protect,
  admin,
  updateOrderStatus
);


module.exports = router;