// models/Cart.js

const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Food",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        image: {
          type: String,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },

        total: {
          type: Number,
          required: true,
        },
      },
    ],

    totalPrice: {
      type: Number,
      default: 0,
    },

    totalItems: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);


// Calculate cart totals before saving
cartSchema.pre("save", async function () {
  this.totalItems = this.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
});

cartSchema.index({ user: 1 }, { unique: true });


module.exports = mongoose.model("Cart", cartSchema);