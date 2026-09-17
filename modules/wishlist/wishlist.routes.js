const express = require("express");
const router = express.Router();
const {
   authenticateUser,
   authorizePermissions,
} = require("../../middleware/authentication");
const {
   addItemToWishlist,
   getWishlistItems,
   removeItemFromWishlist,
} = require("./wishlist.controller");

router.route("/").post(authenticateUser, addItemToWishlist);
router
   .route("/showMyWishlist")
   .get(authenticateUser, authorizePermissions("user"), getWishlistItems);
router
   .route("/:id")
   .delete(
      authenticateUser,
      authorizePermissions("user"),
      removeItemFromWishlist
   );

module.exports = router;
