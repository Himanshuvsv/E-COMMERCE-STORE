const User = require("../modules/user/user.model");
const Product = require("../modules/product/product.model");
const Cart = require("../modules/cart/cart.model");
const Order = require("../modules/order/order.model");
const OrderItem = require("../modules/order/orderItem.model");
const Review = require("../modules/review/review.model");
const Payment = require("../modules/payment/payment.model");
const Wishlist = require("../modules/wishlist/wishlist.model");

User.hasMany(Product, { foreignKey: "userId", as: "products" });
Product.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Cart, { foreignKey: "userId", as: "carts" });
Cart.belongsTo(User, { foreignKey: "userId", as: "user" });
Product.hasMany(Cart, { foreignKey: "productId", as: "carts" });
Cart.belongsTo(Product, { foreignKey: "productId", as: "product" });

User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });
Order.hasMany(OrderItem, {
   foreignKey: "orderId",
   as: "orderItems",
   onDelete: "CASCADE",
});
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

User.hasMany(Review, { foreignKey: "userId", as: "reviews" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });
Product.hasMany(Review, {
   foreignKey: "productId",
   as: "reviews",
   onDelete: "CASCADE",
});
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });

User.hasMany(Payment, { foreignKey: "userId", as: "payments" });
Payment.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Wishlist, { foreignKey: "userId", as: "wishlists" });
Wishlist.belongsTo(User, { foreignKey: "userId", as: "user" });
Product.hasMany(Wishlist, { foreignKey: "productId", as: "wishlists" });
Wishlist.belongsTo(Product, { foreignKey: "productId", as: "product" });

module.exports = {
   User,
   Product,
   Cart,
   Order,
   OrderItem,
   Review,
   Payment,
   Wishlist,
};
