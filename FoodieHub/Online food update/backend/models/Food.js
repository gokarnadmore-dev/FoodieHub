const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Food item name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    image: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    ingredients: [
      {
        type: String,
      },
    ],
    discount: {
      type: Number,
      default: 0,
    },
    details: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

foodSchema.index({ category: 1 });
foodSchema.index({ name: 1 });

module.exports = mongoose.model("Food", foodSchema);
