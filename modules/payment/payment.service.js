const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { sql, sqlOne, withCompat } = require("../../db/query");
const { paymentEmail } = require("../../utils");
const refundEmail = require("../../utils/refundEmail ");
const { StatusCodes } = require("http-status-codes");

const createPaymentIntent = async ({
   user,
   amount,
   currency,
   paymentMethodId,
}) => {
   if (!user) {
      const err = new Error("Unauthorized");
      err.statusCode = StatusCodes.UNAUTHORIZED;
      throw err;
   }

   let customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
   });
   let customer = customers.data.length ? customers.data[0] : null;

   if (!customer) {
      customer = await stripe.customers.create({
         email: user.email,
         name: user.name,
         metadata: { userId: user.userId },
      });
   }

   const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      customer: customer.id,
      receipt_email: user.email,
      metadata: { userId: user.userId },
      automatic_payment_methods: {
         enabled: true,
         allow_redirects: "never",
      },
   });

   if (paymentIntent.status === "succeeded") {
      await sql(
         `INSERT INTO payments (
            id, "userId", "paymentIntentId", "clientSecret", amount, currency,
            status, "refundedDate", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4,
            $5, 'succeeded', NULL, NOW(), NOW()
          )`,
         [
            user.userId,
            paymentIntent.id,
            paymentIntent.client_secret,
            amount,
            currency,
         ]
      );

      await stripe.charges.update(paymentIntent.latest_charge, {
         receipt_email: user.email,
      });

      await paymentEmail(user.name, user.email, paymentIntent);

      return {
         message: "Payment successful !",
         status: "succeeded",
         paymentIntentId: paymentIntent.id,
      };
   }

   const err = new Error("Payment failed!");
   err.statusCode = StatusCodes.BAD_REQUEST;
   err.payload = { message: "Payment failed!", status: "failed" };
   throw err;
};

const processRefund = async (orderId) => {
   const order = await sqlOne(
      `SELECT
         o.*,
         json_build_object(
           'id', u.id,
           'name', u.name,
           'email', u.email
         ) AS "user"
       FROM orders o
       JOIN users u ON u.id = o."userId"
       WHERE o.id = $1
       LIMIT 1`,
      [orderId]
   );

   if (!order) {
      const err = new Error("Order not found");
      err.statusCode = StatusCodes.NOT_FOUND;
      throw err;
   }

   if (order.paymentStatus !== "paid" || order.status !== "canceled") {
      const err = new Error("Refund not applicable");
      err.statusCode = StatusCodes.BAD_REQUEST;
      throw err;
   }

   const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
   });

   await sql(
      `UPDATE orders
       SET "paymentStatus" = 'refunded', "updatedAt" = NOW()
       WHERE id = $1`,
      [orderId]
   );

   const refundAmount = (refund.amount * 100) / 100;
   const refundedDate = refund.created
      ? new Date(refund.created * 1000)
      : null;

   await sql(
      `INSERT INTO payments (
         id, "userId", "paymentIntentId", "clientSecret", amount, currency,
         status, "refundedDate", "createdAt", "updatedAt"
       ) VALUES (
         gen_random_uuid(), $1, $2, $3, $4,
         $5, 'refunded', $6, NOW(), NOW()
       )`,
      [
         order.userId,
         order.paymentIntentId,
         refund.id,
         refundAmount,
         refund.currency,
         refundedDate,
      ]
   );

   refundEmail(
      order.user.name,
      order.user.email,
      order.paymentIntentId,
      refundAmount
   );

   return { message: "Refund processed successfully", refund };
};

const formatPayments = (payments) => {
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

   return {
      summary: {
         all: payments.length,
         succeeded,
         refunded,
         disputed,
         failed,
      },
      payments: formattedPayments,
   };
};

const getPaymentHistory = async (user) => {
   if (!user) {
      const err = new Error("Unauthorized");
      err.statusCode = StatusCodes.UNAUTHORIZED;
      throw err;
   }

   const payments = await sql(
      `SELECT
         p.*,
         json_build_object('email', u.email) AS "user"
       FROM payments p
       LEFT JOIN users u ON u.id = p."userId"
       WHERE p."userId" = $1
       ORDER BY p."createdAt" DESC`,
      [user.userId]
   );

   return formatPayments(payments.map(withCompat));
};

const getAllPayments = async (user) => {
   if (!user || user.role !== "admin") {
      const err = new Error("Forbidden: Admin access required");
      err.statusCode = StatusCodes.FORBIDDEN;
      throw err;
   }

   const payments = await sql(
      `SELECT
         p.*,
         json_build_object('email', u.email) AS "user"
       FROM payments p
       LEFT JOIN users u ON u.id = p."userId"
       ORDER BY p."createdAt" DESC`
   );

   return formatPayments(payments.map(withCompat));
};

module.exports = {
   createPaymentIntent,
   processRefund,
   getPaymentHistory,
   getAllPayments,
};
