// routes/cartRoutes.js

const router = require("express").Router();

const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middlewares/authMiddleware");


// Add product to cart
router.post(
  "/add",
  protect,
  addToCart
);


// Get user cart
router.get(
  "/",
  protect,
  getCart
);


// Update cart item quantity
router.put(
  "/update/:id",
  protect,
  updateCartItem
);


// Remove item from cart
router.delete(
  "/remove/:id",
  protect,
  removeCartItem
);


// Clear complete cart
router.delete(
  "/clear",
  protect,
  clearCart
);


module.exports = router;