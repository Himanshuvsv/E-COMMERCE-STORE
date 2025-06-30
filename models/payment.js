const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      paymentIntentId: { type: String, required: true },
      clientSecret: { type: String, required: true },
      amount: { type: Number, required: true },
      currency: { type: String, default: "usd" },
      status: { type: String, default: "pending" },
      refundedDate: {type: Date}
   },
   { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
