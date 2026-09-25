const router = require("express").Router();
const {
  submitSuggestion,
  getSuggestions,
  getMySuggestions,
  approveSuggestion,
  rejectSuggestion
} = require("../controllers/suggestionController");
const { protect, admin } = require("../middlewares/authMiddleware");

// Submit suggestion
router.post("/", protect, submitSuggestion);

// Get all suggestions (admin)
router.get("/", protect, admin, getSuggestions);

// Get my own suggestions (logged-in user)
router.get("/my", protect, getMySuggestions);

// Approve
router.put("/approve/:id", protect, admin, approveSuggestion);

// Reject
router.put("/reject/:id", protect, admin, rejectSuggestion);

module.exports = router;
