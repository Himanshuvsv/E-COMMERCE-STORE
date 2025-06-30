const mongoose = require("mongoose");
const wishlistSchema = mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      product: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Product",
         required: true,
      },
      addedOn: {
         type: Date,
         default: Date.now 
      }
   },
   { timestamps: true }
);
module.exports = mongoose.model("Wishlist", wishlistSchema);