const { StatusCodes } = require("http-status-codes");
const paymentService = require("./payment.service");

const createPaymentIntent = async (req, res) => {
   try {
      const { amount, currency, paymentMethodId } = req.body;
      const result = await paymentService.createPaymentIntent({
         user: req.user,
         amount,
         currency,
         paymentMethodId,
      });
      res.status(StatusCodes.OK).json(result);
   } catch (error) {
      if (error.payload) {
         return res.status(error.statusCode || StatusCodes.BAD_REQUEST).json(error.payload);
      }
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      if (statusCode === StatusCodes.UNAUTHORIZED) {
         return res.status(statusCode).json({ message: "Unauthorized" });
      }
      res.status(statusCode).json({ error: error.message });
   }
};

const processRefund = async (req, res) => {
   try {
      const result = await paymentService.processRefund(req.params.id);
      res.status(StatusCodes.OK).json(result);
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      if (statusCode === StatusCodes.NOT_FOUND) {
         return res.status(statusCode).json({ message: "Order not found" });
      }
      if (statusCode === StatusCodes.BAD_REQUEST) {
         return res
            .status(statusCode)
            .json({ message: "Refund not applicable" });
      }
      res.status(statusCode).json({ error: error.message });
   }
};

const getPaymentHistory = async (req, res) => {
   try {
      const result = await paymentService.getPaymentHistory(req.user);
      res.status(StatusCodes.OK).json(result);
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      if (statusCode === StatusCodes.UNAUTHORIZED) {
         return res.status(statusCode).json({ message: "Unauthorized" });
      }
      res.status(statusCode).json({ error: error.message });
   }
};

const getAllPayments = async (req, res) => {
   try {
      const result = await paymentService.getAllPayments(req.user);
      res.status(StatusCodes.OK).json(result);
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      if (statusCode === StatusCodes.FORBIDDEN) {
         return res
            .status(statusCode)
            .json({ message: "Forbidden: Admin access required" });
      }
      res.status(statusCode).json({ error: error.message });
   }
};

module.exports = {
   createPaymentIntent,
   processRefund,
   getPaymentHistory,
   getAllPayments,
};
