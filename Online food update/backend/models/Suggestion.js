const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  desc: { type: String, default: "" },
  image: { type: String, required: true },
  suggestedBy: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
}, { timestamps: true });

suggestionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Suggestion", suggestionSchema);
