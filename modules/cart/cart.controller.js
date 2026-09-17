const { StatusCodes } = require("http-status-codes");
const cartService = require("./cart.service");

const addItemToCart = async (req, res) => {
   try {
      const { productId, quantity } = req.body;
      const { item, created } = await cartService.addItemToCart({
         userId: req.user.userId,
         productId,
         quantity,
      });
      res.status(created ? StatusCodes.CREATED : StatusCodes.OK).json({ item });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getCartItemUser = async (req, res) => {
   try {
      const cartItems = await cartService.getCartItemUser(req.user.userId);
      if (!cartItems || cartItems.length === 0) {
         return res
            .status(StatusCodes.OK)
            .json({ message: "No items in the card" });
      }
      res.status(StatusCodes.OK).json(cartItems);
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const removeItemFromCart = async (req, res) => {
   try {
      await cartService.removeItemFromCart({
         itemId: req.params.id,
         userId: req.user.userId,
      });
      res.status(StatusCodes.OK).json({ message: "Item removed from cart" });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

module.exports = {
   getCartItemUser,
   addItemToCart,
   removeItemFromCart,
};
