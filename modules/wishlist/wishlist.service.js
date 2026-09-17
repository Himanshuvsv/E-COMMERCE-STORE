const Wishlist = require("./wishlist.model");
const Product = require("../product/product.model");
const CustomError = require("../../errors");

const addItemToWishlist = async ({ userId, productId }) => {
   const isProduct = await Product.findByPk(productId);
   if (!isProduct) {
      throw new CustomError.NotFoundError("Product not found");
   }

   const isWishlist = await Wishlist.findOne({
      where: { userId, productId },
   });
   if (isWishlist) {
      throw new CustomError.BadRequestError("Product already in wishlist");
   }

   return Wishlist.create({ userId, productId });
};

const getWishlistItems = async (userId) => {
   return Wishlist.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
   });
};

const removeItemFromWishlist = async ({ wishlistId, userId }) => {
   const deleted = await Wishlist.destroy({
      where: { id: wishlistId, userId },
   });
   if (!deleted) {
      throw new CustomError.NotFoundError(
         `No item with ID ${wishlistId} in your wishlist`
      );
   }
};

module.exports = {
   addItemToWishlist,
   getWishlistItems,
   removeItemFromWishlist,
};
