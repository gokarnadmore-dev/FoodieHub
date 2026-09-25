// models/Review.js

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      trim: true,
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);