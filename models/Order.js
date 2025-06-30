const mongoose = require("mongoose");

const SingleOrderItemSchema = new mongoose.Schema({
   product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
   },
   name: { type: String, required: true },
   description: { type: String },
   category: { type: String, required: true },
   price: { type: Number, required: true },
   image: { type: String, required: true },
   quantity: { type: Number, default: 1 },
});

const OrderSchema = new mongoose.Schema(
   {
      orderItems: [SingleOrderItemSchema],
      subtotal: { type: Number },
      shippingFee: { type: Number },
      total: { type: Number },
      status: {
         type: String,
         enum: [
            "pending",
            "canceled",
            "failed",
            "delivered",
            "shipped",
            "processing",
         ],
         default: "pending",
      },
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      paymentStatus: {
         type: String,
         enum: ["pending", "paid", "refunded"],
         default: "pending",
      },
      paymentIntentId: { type: String },
   },
   { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
