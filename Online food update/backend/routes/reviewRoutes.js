const router = require("express").Router();
const { addReview, getReviews, getMyReviews } = require("../controllers/reviewController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, addReview);
router.get("/", protect, getReviews);
router.get("/my", protect, getMyReviews);

module.exports = router;
