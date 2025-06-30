const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

const createOrder = async (req, res) => {
   try {
      const userId = req.user.userId;
      const { cartItems } = req.body;

      if (!cartItems || cartItems.length === 0) {
         throw new CustomError.BadRequestError("No Cart Items Provided");
      }

      const orderItems = cartItems.map((item) => ({
         product: item.product,
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
      const newOrder = await Order.create({
         orderItems,
         subtotal,
         shippingFee,
         total,
         user: userId,
      });

      for (const item of orderItems) {
         const product = await Product.findById(item.product);
         if (product) {
            product.inventory -= item.quantity;
            await product.save();
         }
      }

      await Cart.deleteMany({ user: userId });

      res.status(StatusCodes.CREATED).json({
         message: "Order placed successfully",
         order: newOrder,
      });

   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getAllOrders = async (req, res) => {
   try {
      const { orderId, name, status } = req.query;
      let query = {};

      if (orderId) {
         query._id = orderId;
      }

      if (status) {
         query.status = status;
      }

      let orders = await Order.find(query).populate("user");

      if (name) {
         const searchTerms = name.toLowerCase().split(" ");
         orders = orders.filter((order) =>
            order.orderItems.some((item) => {
               const productName = item.name.toLowerCase();
               return searchTerms.every((term) => productName.includes(term));
            })
         );
      }

      const statusCounts = await Order.aggregate([
         {
            $group: {
               _id: "$status",
               count: { $sum: 1 },
            },
         },
      ]);

      const orderStatusCounts = {
         pending: 0,
         canceled: 0,
         failed: 0,
         delivered: 0,
         shipped: 0,
         processing: 0,
      };

      statusCounts.forEach((status) => {
         orderStatusCounts[status._id] = status.count;
      });

      res.status(StatusCodes.OK).json({
         orderStatusCounts,
         numberOfOrders: orders.length,
         orders,
      });

   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getSingleOrder = async (req, res) => {
   try {
      const { id: orderId } = req.params;
      const order = await Order.findOne({ _id: orderId });
      if (!order) {
         throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
      }
      checkPermissions(req.user, order.user);
      res.status(StatusCodes.OK).json({ order });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getCurrentUserOrders = async (req, res) => {
   try {
      const orders = await Order.find({ user: req.user.userId });
      res.status(StatusCodes.OK).json({ TotalOrders: orders.length, orders });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const updateOrder = async (req, res) => {
   try {
      const { id: orderId } = req.params;
      const order = await Order.findByIdAndUpdate({ _id: orderId }, req.body, {
         new: true,
         runValidators: true,
      });
      if (!order)
         throw new CustomError.BadRequestError(`No Order With Id ${orderId}`);

      res.status(StatusCodes.OK).json({ order });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const cancelOrder = async (req, res) => {
   try {
      const { id: orderId } = req.params;
      const order = await Order.findOne({ _id: orderId });
      if (!order) {
         throw new CustomError.NotFoundError(
            `order not found with id ${orderId}`
         );
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
         const product = await Product.findById(item.product);
         if (product) {
            product.inventory += item.quantity;
            await product.save();
         }
      }

      res.status(StatusCodes.OK).json({
         message: "Order cancelled successfully",
         order,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const deleteOrder = async (req, res) => {
   try {
      const { id: orderId } = req.params;
      const order = await Order.findByIdAndDelete({ _id: orderId });
      if (!order)
         throw new CustomError.BadRequestError(`No order with id ${orderId}`);
      res.status(StatusCodes.OK).json({
         message: `Successfully delete order with id: ${orderId}`,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getDashboardStats = async (req, res) => {
   try {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));

      const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfLastMonth = new Date(
         today.getFullYear(),
         today.getMonth() - 1,
         1
      );
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      const todayOrders = await Order.countDocuments({
         createdAt: { $gte: startOfToday, $lte: endOfToday },
      });
      const yesterdayOrders = await Order.countDocuments({
         createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
      });
      const thisMonthOrders = await Order.countDocuments({
         createdAt: { $gte: startOfMonth },
      });
      const lastMonthOrders = await Order.countDocuments({
         createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      });
      const allTimeOrders = await Order.countDocuments();

      res.status(StatusCodes.OK).json({
         todayOrders,
         yesterdayOrders,
         thisMonthOrders,
         lastMonthOrders,
         allTimeOrders,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
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
