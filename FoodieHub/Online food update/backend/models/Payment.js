// models/Payment.js

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "CARD", "UPI", "NETBANKING", "WALLET"],
      required: true,
    },

    paymentId: {
      type: String,
      default: "",
    },

    transactionId: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Success",
        "Failed",
        "Refunded"
      ],
      default: "Pending",
    },

    paidAt: {
      type: Date,
    },

    failureReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Payment", paymentSchema);