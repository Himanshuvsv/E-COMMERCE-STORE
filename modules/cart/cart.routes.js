const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../../middleware/authentication");
const {
   addItemToCart,
   getCartItemUser,
   removeItemFromCart,
} = require("./cart.controller");

router.get("/", authenticateUser, getCartItemUser);
router.post("/", authenticateUser, addItemToCart);
router.delete("/:id", authenticateUser, removeItemFromCart);

module.exports = router;
