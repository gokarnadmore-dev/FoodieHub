// // routes/authRoutes.js

// const router = require("express").Router();

// const {
//   registerUser,
//   loginUser,
//   logoutUser,
//   getProfile,
// } = require("../controllers/authController");

// const { authMiddleware } = require("../middlewares/authMiddleware");


// // Register
// router.post("/register", registerUser);


// // Login
// router.post("/login", loginUser);


// // Logout
// router.post("/logout", authMiddleware, logoutUser);


// // User Profile
// router.get("/profile", authMiddleware, getProfile);


// module.exports = router;

const router = require("express").Router();

const {
    register,
    login,
    getProfile
} = require("../controllers/authController");

const {
    protect
} = require("../middlewares/authMiddleware");

router.post("/register", register);

router.post("/login", login);

// Comment this until logout is implemented
// router.post("/logout", authMiddleware, logoutUser);

router.get("/profile", protect, getProfile);

module.exports = router;