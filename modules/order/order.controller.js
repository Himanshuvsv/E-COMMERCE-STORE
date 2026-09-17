const { StatusCodes } = require("http-status-codes");
const orderService = require("./order.service");

const createOrder = async (req, res) => {
   try {
      const order = await orderService.createOrder({
         userId: req.user.userId,
         cartItems: req.body.cartItems,
      });
      res.status(StatusCodes.CREATED).json({
         message: "Order placed successfully",
         order,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getAllOrders = async (req, res) => {
   try {
      const result = await orderService.getAllOrders(req.query);
      res.status(StatusCodes.OK).json(result);
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getSingleOrder = async (req, res) => {
   try {
      const order = await orderService.getSingleOrder({
         orderId: req.params.id,
         requestUser: req.user,
      });
      res.status(StatusCodes.OK).json({ order });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getCurrentUserOrders = async (req, res) => {
   try {
      const result = await orderService.getCurrentUserOrders(req.user.userId);
      res.status(StatusCodes.OK).json(result);
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const updateOrder = async (req, res) => {
   try {
      const order = await orderService.updateOrder(req.params.id, req.body);
      res.status(StatusCodes.OK).json({ order });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const cancelOrder = async (req, res) => {
   try {
      const order = await orderService.cancelOrder(req.params.id);
      res.status(StatusCodes.OK).json({
         message: "Order cancelled successfully",
         order,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const deleteOrder = async (req, res) => {
   try {
      await orderService.deleteOrder(req.params.id);
      res.status(StatusCodes.OK).json({
         message: `Successfully delete order with id: ${req.params.id}`,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getDashboardStats = async (req, res) => {
   try {
      const stats = await orderService.getDashboardStats();
      res.status(StatusCodes.OK).json(stats);
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
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
