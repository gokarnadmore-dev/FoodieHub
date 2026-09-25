const mongoose = require("mongoose");

const cateringRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: "CateringPackage", required: true },
  eventType: { type: String, required: true },
  guestCount: { type: Number, required: true },
  eventDate: { type: Date, required: true },
  specialRequests: { type: String, default: "" },
  status: { type: String, enum: ["pending", "approved", "rejected", "completed"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("CateringRequest", cateringRequestSchema);
