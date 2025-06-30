const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const addItemToCart = async (req, res) => {
   try {
      
      req.body.user = req.user.userId;
      const { productId, quantity } = req.body;
      const product = await Product.findById({ _id: productId });
      if (!product) {
         throw new CustomError.NotFoundError("Product not found");
      }
      const imagePath = product.image.replace("http://127.0.0.1:5000/", "");

      const existingCartItem = await Cart.findOne({
         product: productId,
         user: req.user.userId,
      });

      if (existingCartItem) {
         existingCartItem.quantity += quantity || 1;
         await existingCartItem.save();
         return res.status(StatusCodes.OK).json({ item: existingCartItem });
      }

      const cartItem = await Cart.create({
         product: productId,
         name: product.name,
         description: product.description,
         category: product.category,
         price: product.price,
         image: imagePath,
         quantity: quantity || 1,
         user: req.user.userId,
      });
      
      res.status(StatusCodes.CREATED).json({ item: cartItem });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getCartItemUser = async (req, res) => {
   try {
      req.body.user = req.user.userId;
      const userId = req.body.user;
      const cartItems = await Cart.find({ user: userId }).populate("product");

      if (!cartItems || cartItems.length === 0) {
         return res
            .status(StatusCodes.OK)
            .json({ message: "No items in the card" });
      }
      res.status(StatusCodes.OK).json(cartItems);
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};


const removeItemFromCart = async (req, res) => {
   try {
      const { id: itemId } = req.params;
      const deletedItem = await Cart.findOneAndDelete({
         _id: itemId,
         user: req.user.userId,
      });
      if (!deletedItem) {
         throw new CustomError.NotFoundError(
            `No product with id ${itemId} found in your cart`
         );
      }
      res.status(StatusCodes.OK).json({ message: "Item removed from cart" });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

module.exports = {
   getCartItemUser,
   addItemToCart,
   removeItemFromCart,
};
