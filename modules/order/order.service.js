const { Op } = require("sequelize");
const Order = require("./order.model");
const OrderItem = require("./orderItem.model");
const Cart = require("../cart/cart.model");
const Product = require("../product/product.model");
const User = require("../user/user.model");
const sequelize = require("../../db/sequelize");
const CustomError = require("../../errors");
const { checkPermissions } = require("../../utils");

const resolveProductId = (item) =>
   item.productId ||
   (typeof item.product === "object" ? item.product?.id || item.product?._id : item.product);

const createOrder = async ({ userId, cartItems }) => {
   if (!cartItems || cartItems.length === 0) {
      throw new CustomError.BadRequestError("No Cart Items Provided");
   }

   const orderItemsPayload = cartItems.map((item) => ({
      productId: resolveProductId(item),
      name: item.name,
      description: item.description || "",
      category: item.category,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
   }));

   const subtotal = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
   );
   const shippingFee = 50;
   const total = subtotal + shippingFee;

   const result = await sequelize.transaction(async (t) => {
      const newOrder = await Order.create(
         {
            subtotal,
            shippingFee,
            total,
            userId,
         },
         { transaction: t }
      );

      await OrderItem.bulkCreate(
         orderItemsPayload.map((item) => ({
            ...item,
            orderId: newOrder.id,
         })),
         { transaction: t }
      );

      for (const item of orderItemsPayload) {
         const product = await Product.findByPk(item.productId, {
            transaction: t,
         });
         if (product) {
            product.inventory -= item.quantity;
            await product.save({ transaction: t });
         }
      }

      await Cart.destroy({ where: { userId }, transaction: t });

      return Order.findByPk(newOrder.id, {
         include: [{ model: OrderItem, as: "orderItems" }],
         transaction: t,
      });
   });

   return result;
};

const getAllOrders = async ({ orderId, name, status }) => {
   const where = {};
   if (orderId) where.id = orderId;
   if (status) where.status = status;

   let orders = await Order.findAll({
      where,
      include: [
         { model: User, as: "user" },
         { model: OrderItem, as: "orderItems" },
      ],
   });

   if (name) {
      const searchTerms = name.toLowerCase().split(" ");
      orders = orders.filter((order) =>
         order.orderItems.some((item) => {
            const productName = item.name.toLowerCase();
            return searchTerms.every((term) => productName.includes(term));
         })
      );
   }

   const statusCounts = await Order.findAll({
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
      raw: true,
   });

   const orderStatusCounts = {
      pending: 0,
      canceled: 0,
      failed: 0,
      delivered: 0,
      shipped: 0,
      processing: 0,
   };

   statusCounts.forEach((row) => {
      orderStatusCounts[row.status] = Number(row.count);
   });

   return {
      orderStatusCounts,
      numberOfOrders: orders.length,
      orders,
   };
};

const getSingleOrder = async ({ orderId, requestUser }) => {
   const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: "orderItems" }],
   });
   if (!order) {
      throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
   }
   checkPermissions(requestUser, order.userId);
   return order;
};

const getCurrentUserOrders = async (userId) => {
   const orders = await Order.findAll({
      where: { userId },
      include: [{ model: OrderItem, as: "orderItems" }],
   });
   return { TotalOrders: orders.length, orders };
};

const updateOrder = async (orderId, body) => {
   const order = await Order.findByPk(orderId);
   if (!order) {
      throw new CustomError.BadRequestError(`No Order With Id ${orderId}`);
   }
   await order.update(body);
   return order;
};

const cancelOrder = async (orderId) => {
   const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: "orderItems" }],
   });
   if (!order) {
      throw new CustomError.NotFoundError(`order not found with id ${orderId}`);
   }
   if (order.status === "canceled") {
      throw new CustomError.BadRequestError(
         `Order is already cancelled with id: ${orderId}`
      );
   }
   if (["shipped", "delivered"].includes(order.status)) {
      throw new CustomError.BadRequestError(
         `Order cannot be cancelled at this stage`
      );
   }

   order.status = "canceled";
   await order.save();

   for (const item of order.orderItems) {
      const product = await Product.findByPk(item.productId);
      if (product) {
         product.inventory += item.quantity;
         await product.save();
      }
   }

   return order;
};

const deleteOrder = async (orderId) => {
   const order = await Order.findByPk(orderId);
   if (!order) {
      throw new CustomError.BadRequestError(`No order with id ${orderId}`);
   }
   await OrderItem.destroy({ where: { orderId } });
   await order.destroy();
};

const getDashboardStats = async () => {
   const today = new Date();
   const yesterday = new Date();
   yesterday.setDate(today.getDate() - 1);

   const startOfToday = new Date(today);
   startOfToday.setHours(0, 0, 0, 0);
   const endOfToday = new Date(today);
   endOfToday.setHours(23, 59, 59, 999);

   const startOfYesterday = new Date(yesterday);
   startOfYesterday.setHours(0, 0, 0, 0);
   const endOfYesterday = new Date(yesterday);
   endOfYesterday.setHours(23, 59, 59, 999);

   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
   const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
   );
   const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

   const todayOrders = await Order.count({
      where: { createdAt: { [Op.between]: [startOfToday, endOfToday] } },
   });
   const yesterdayOrders = await Order.count({
      where: {
         createdAt: { [Op.between]: [startOfYesterday, endOfYesterday] },
      },
   });
   const thisMonthOrders = await Order.count({
      where: { createdAt: { [Op.gte]: startOfMonth } },
   });
   const lastMonthOrders = await Order.count({
      where: {
         createdAt: { [Op.between]: [startOfLastMonth, endOfLastMonth] },
      },
   });
   const allTimeOrders = await Order.count();

   return {
      todayOrders,
      yesterdayOrders,
      thisMonthOrders,
      lastMonthOrders,
      allTimeOrders,
   };
};

module.exports = {
   getAllOrders,
   getSingleOrder,
   getCurrentUserOrders,
   createOrder,
   updateOrder,
   cancelOrder,
   deleteOrder,
   getDashboardStats,
};
