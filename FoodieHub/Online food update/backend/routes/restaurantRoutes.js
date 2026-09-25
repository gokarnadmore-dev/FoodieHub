// routes/restaurantRoutes.js

const router = require("express").Router();

const {
  createRestaurant,
  getAllRestaurants,
  getSingleRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

const { protect, admin } = require("../middlewares/authMiddleware");

const upload = require("../middlewares/uploadMiddleware");


// Create restaurant
router.post(
  "/create",
  protect,
  admin,
  upload.single("image"),
  createRestaurant
);


// Get all restaurants
router.get(
  "/",
  getAllRestaurants
);


// Get single restaurant
router.get(
  "/:id",
  getSingleRestaurant
);


// Update restaurant
router.put(
  "/update/:id",
  protect,
  admin,
  upload.single("image"),
  updateRestaurant
);


// Delete restaurant
router.delete(
  "/delete/:id",
  protect,
  admin,
  deleteRestaurant
);


module.exports = router;