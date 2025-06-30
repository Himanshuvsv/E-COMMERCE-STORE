const {
   authenticateUser,
   authorizePermissions,
} = require("../middleware/authentication");
const {
   addItemToWishlist,
   getWishlistItems,
   removeItemFromWishlist,
} = require("../controllers/wishlistController");

const express = require("express");
const router = express.Router();

router.route("/").post(authenticateUser, addItemToWishlist);

router
   .route("/:id")
   .delete(
      authenticateUser,
      authorizePermissions("user"),
      removeItemFromWishlist
   );
router
   .route("/showMyWishlist")
   .get(authenticateUser, authorizePermissions("user"), getWishlistItems);

module.exports = router;
