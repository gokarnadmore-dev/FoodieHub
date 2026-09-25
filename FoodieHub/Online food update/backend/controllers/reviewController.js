const Review = require("../models/Review");
const { getIO } = require("../utils/socket");

exports.addReview = async (req, res) => {
  try {
    const { title, rating, comment } = req.body;

    if (!title || !comment || !rating) {
      return res.status(400).json({ message: "Title, rating, and comment are required" });
    }

    const review = await Review.create({
      user: req.user._id,
      title: String(title).trim(),
      rating: Number(rating),
      comment: String(comment).trim(),
      isApproved: true,
    });

    const payload = await review.populate("user", "name email");

    try {
      getIO().to("admins").emit("review:new", payload);
      getIO().to(`user_${req.user._id}`).emit("review:new", payload);
    } catch (socketErr) {
      console.warn("Socket emit skipped (review:new):", socketErr.message);
    }

    res.status(201).json({ message: "Feedback submitted successfully", review: payload });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
