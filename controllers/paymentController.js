const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/payment");
const Order = require("../models/Order");
const { paymentEmail } = require("../utils");
const refundEmail = require("../utils/refundEmail ");
const { StatusCodes } = require("http-status-codes");

const createPaymentIntent = async (req, res) => {
   try {
      const { amount, currency, paymentMethodId } = req.body;

      if (!req.user) {
         return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "Unauthorized" });
      }

      let customers = await stripe.customers.list({
         email: req.user.email,
         limit: 1,
      });
      let customer = customers.data.length ? customers.data[0] : null;

      if (!customer) {
         customer = await stripe.customers.create({
            email: req.user.email,
            name: req.user.name,
            metadata: { userId: req.user.userId },
         });
      }

      const paymentIntent = await stripe.paymentIntents.create({
         amount: amount,
         currency,
         payment_method: paymentMethodId,
         confirm: true,
         customer: customer.id,
         receipt_email: req.user.email,
         metadata: { userId: req.user.userId },
         automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
         },
      });

      if (paymentIntent.status === "succeeded") {
         const payment = new Payment({
            user: req.user.userId,
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            amount,
            currency,
            status: "succeeded",
         });

         await payment.save();
         await stripe.charges.update(paymentIntent.latest_charge, {
            receipt_email: req.user.email,
         });

         await paymentEmail(req.user.name, req.user.email, paymentIntent);

         return res.status(StatusCodes.OK).json({
            message: "Payment successful !",
            status: "succeeded",
            paymentIntentId: paymentIntent.id,
         });
      } else {
         return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Payment failed!",
            status: "failed",
         });
      }
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const processRefund = async (req, res) => {
   try {
      const { id: orderId } = req.params;
      const order = await Order.findById(orderId).populate("user");

      if (!order) {
         return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: "Order not found" });
      }

      if (order.paymentStatus !== "paid" || order.status !== "canceled") {
         return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Refund not applicable" });
      }

      const refund = await stripe.refunds.create({
         payment_intent: order.paymentIntentId,
      });

      order.paymentStatus = "refunded";
      await order.save();

      const refundAmount = (refund.amount * 100) / 100;
      const refundedDate = refund.created
         ? new Date(refund.created * 1000)
         : null;

      const payment = new Payment({
         user: order.user,
         paymentIntentId: order.paymentIntentId,
         clientSecret: refund.id,
         amount: refundAmount,
         currency: refund.currency,
         status: "refunded",
         refundedDate: refundedDate,
      });

      await payment.save();

      const customerName = order.user.name;
      const customerEmail = order.user.email;

      refundEmail(
         customerName,
         customerEmail,
         order.paymentIntentId,
         refundAmount
      );

      res.status(StatusCodes.OK).json({
         message: "Refund processed successfully",
         refund,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getPaymentHistory = async (req, res) => {
   try {
      if (!req.user) {
         return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "Unauthorized" });
      }
      const payments = await Payment.find({ user: req.user.userId })
         .sort({ createdAt: -1 })
         .populate("user", "email");

      let succeeded = 0,
         refunded = 0,
         disputed = 0,
         failed = 0;

      const formattedPayments = payments.map((payment) => {
         if (payment.status === "succeeded") succeeded++;
         else if (payment.status === "refunded") refunded++;
         else if (payment.status === "disputed") disputed++;
         else if (payment.status === "failed") failed++;

         return {
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            description: payment.paymentIntentId,
            customer: payment.user.email,
            date: payment.createdAt,
            refundedDate: payment.refundedDate,
            status: payment.status,
            declineReason: payment.declineReason,
         };
      });

      res.status(StatusCodes.OK).json({
         summary: {
            all: payments.length,
            succeeded,
            refunded,
            disputed,
            failed,
         },
         payments: formattedPayments,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getAllPayments = async (req, res) => {
   try {
      if (!req.user || req.user.role !== "admin") {
         return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "Forbidden: Admin access required" });
      }

      const payments = await Payment.find({}).populate("user", "email");

      let succeeded = 0,
         refunded = 0,
         disputed = 0,
         failed = 0;

      const formattedPayments = payments.map((payment) => {
         if (payment.status === "succeeded") succeeded++;
         else if (payment.status === "refunded") refunded++;
         else if (payment.status === "disputed") disputed++;
         else if (payment.status === "failed") failed++;

         return {
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            description: payment.paymentIntentId,
            customer: payment.user ? payment.user.email : "Unknown",
            date: payment.createdAt,
            refundedDate: payment.refundedDate || null,
            status: payment.status,
            declineReason: payment.declineReason || null,
         };
      });

      res.status(StatusCodes.OK).json({
         summary: {
            all: payments.length,
            succeeded,
            refunded,
            disputed,
            failed,
         },
         payments: formattedPayments,
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

module.exports = {
   createPaymentIntent,
   processRefund,
   getPaymentHistory,
   getAllPayments,
};
