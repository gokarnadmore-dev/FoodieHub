const mongoose = require("mongoose");

const cateringPackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  pricePerPerson: { type: Number, required: true },
  minGuests: { type: Number, default: 10 },
  items: [{ type: String }],
  image: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("CateringPackage", cateringPackageSchema);
