// routes/menuRoutes.js

const router = require("express").Router();

const {
  createMenu,
  getAllMenu,
  getSingleMenu,
  updateMenu,
  deleteMenu,
  searchFood,
  getFoodByCategory,
} = require("../controllers/menuController");

const { protect, admin } = require("../middlewares/authMiddleware");

const upload = require("../middlewares/uploadMiddleware");


// Create menu item
router.post(
  "/create",
  protect,
  admin,
  upload.single("image"),
  createMenu
);


// Get all menu items
router.get(
  "/",
  getAllMenu
);


// Get single menu item
router.get(
  "/:id",
  getSingleMenu
);


// Update menu item
router.put(
  "/update/:id",
  protect,
  admin,
  upload.single("image"),
  updateMenu
);


// Delete menu item
router.delete(
  "/delete/:id",
  protect,
  admin,
  deleteMenu
);

// Search food
router.get("/search/query", searchFood);

// Get by category
router.get("/category/:category", getFoodByCategory);

module.exports = router;