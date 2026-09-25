// routes/paymentRoutes.js

const router = require("express").Router();

const {
  createPayment,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
} = require("../controllers/paymentController");

const { protect, admin } = require("../middlewares/authMiddleware");


// Create payment
router.post(
  "/create",
  protect,
  createPayment
);


// Verify payment
router.post(
  "/verify",
  protect,
  verifyPayment
);


// Get payment details
router.get(
  "/:id",
  protect,
  getPaymentDetails
);


// Refund payment (Admin)
router.put(
  "/refund/:id",
  protect,
  admin,
  refundPayment
);


module.exports = router;