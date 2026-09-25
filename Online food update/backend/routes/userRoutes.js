// routes/userRoutes.js

const router = require("express").Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userController");

const { protect, admin } = require("../middlewares/authMiddleware");

const upload = require("../middlewares/uploadMiddleware");


// Get user profile
router.get(
  "/profile",
  protect,
  getProfile
);


// Update profile
router.put(
  "/update",
  protect,
  upload.single("image"),
  updateProfile
);


// Change password
router.put(
  "/change-password",
  protect,
  changePassword
);


// Delete account
router.delete(
  "/delete",
  protect,
  deleteAccount
);

// Admin Routes
router.get("/all", protect, admin, require("../controllers/userController").getAllUsers);
router.put("/promote/:id", protect, admin, require("../controllers/userController").promoteUser);
router.delete("/delete/:id", protect, admin, require("../controllers/userController").deleteUserById);


module.exports = router;