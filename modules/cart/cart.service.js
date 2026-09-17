const Cart = require("./cart.model");
const Product = require("../product/product.model");
const CustomError = require("../../errors");

const addItemToCart = async ({ userId, productId, quantity }) => {
   const product = await Product.findByPk(productId);
   if (!product) {
      throw new CustomError.NotFoundError("Product not found");
   }

   const imagePath = String(product.image || "").replace(
      /^https?:\/\/[^/]+/,
      ""
   );

   const existingCartItem = await Cart.findOne({
      where: { productId, userId },
   });

   if (existingCartItem) {
      existingCartItem.quantity += quantity || 1;
      await existingCartItem.save();
      return { item: existingCartItem, created: false };
   }

   const cartItem = await Cart.create({
      productId,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      image: imagePath,
      quantity: quantity || 1,
      userId,
   });

   return { item: cartItem, created: true };
};

const getCartItemUser = async (userId) => {
   return Cart.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
   });
};

const removeItemFromCart = async ({ itemId, userId }) => {
   const deleted = await Cart.destroy({
      where: { id: itemId, userId },
   });
   if (!deleted) {
      throw new CustomError.NotFoundError(
         `No product with id ${itemId} found in your cart`
      );
   }
};

module.exports = {
   addItemToCart,
   getCartItemUser,
   removeItemFromCart,
};
