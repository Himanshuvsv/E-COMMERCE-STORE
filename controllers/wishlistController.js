const Product = require("../models/Product");
const Wishlist = require("../models/wishlist");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const addItemToWishlist = async (req, res) => {
   try {
      const userId = req.user.userId;
      const productId = req.body.productId;
      const isProduct = await Product.findById(productId);
      if (!isProduct) {
         throw new CustomError.NotFoundError("Product not found");
      }
      const isWishlist = await Wishlist.findOne({
         user: userId,
         product: productId,
      });
      if (isWishlist) {
         throw new CustomError.BadRequestError("Product already in wishlist");
      }

      const wishlistItem = await Wishlist.create({
         user: userId,
         product: productId,
      });

      res.status(StatusCodes.CREATED).json({
         message: "Item successfully added to wishlist",
         wishlist: wishlistItem,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getWishlistItems = async (req, res) => {
   try {
      const userId = req.user.userId;
      const wishlistData = await Wishlist.find({ user: userId }).populate(
         "product"
      );
      if (wishlistData.length === 0) {
         return res.status(StatusCodes.OK).json({ message: "No data found" });
      }
      res.status(StatusCodes.OK).json({ wishlistData: wishlistData });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const removeItemFromWishlist = async (req, res) => {
   try {
      const userId = req.user.userId;
      const { id: wishlistId } = req.params;
      const wishlistItem = await Wishlist.findOneAndDelete({
         _id: wishlistId,
         user: userId,
      });
      if (!wishlistItem) {
         throw new CustomError.NotFoundError(
            `No item with ID ${wishlistId} in your wishlist`
         );
      }
      res.status(StatusCodes.OK).json({
         message: "Success! Item removed from wishlist",
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

module.exports = {
   addItemToWishlist,
   getWishlistItems,
   removeItemFromWishlist,
};
