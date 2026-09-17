const { StatusCodes } = require("http-status-codes");
const wishlistService = require("./wishlist.service");

const addItemToWishlist = async (req, res) => {
   try {
      const wishlist = await wishlistService.addItemToWishlist({
         userId: req.user.userId,
         productId: req.body.productId,
      });
      res.status(StatusCodes.CREATED).json({
         message: "Item successfully added to wishlist",
         wishlist,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getWishlistItems = async (req, res) => {
   try {
      const wishlistData = await wishlistService.getWishlistItems(
         req.user.userId
      );
      if (wishlistData.length === 0) {
         return res.status(StatusCodes.OK).json({ message: "No data found" });
      }
      res.status(StatusCodes.OK).json({ wishlistData });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const removeItemFromWishlist = async (req, res) => {
   try {
      await wishlistService.removeItemFromWishlist({
         wishlistId: req.params.id,
         userId: req.user.userId,
      });
      res.status(StatusCodes.OK).json({
         message: "Success! Item removed from wishlist",
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

module.exports = {
   addItemToWishlist,
   getWishlistItems,
   removeItemFromWishlist,
};
