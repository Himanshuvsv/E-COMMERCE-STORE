const express = require("express");
const router = express.Router();
const {
   createPaymentIntent,
   processRefund,
   getPaymentHistory,
   getAllPayments,
} = require("./payment.controller");
const {
   authenticateUser,
   authorizePermissions,
} = require("../../middleware/authentication");

router.post("/create-payment-intent", authenticateUser, createPaymentIntent);
router.post("/payment-refund/:id", authenticateUser, processRefund);
router.get("/paymentHistory", authenticateUser, getPaymentHistory);
router.get(
   "/",
   authenticateUser,
   authorizePermissions("admin"),
   getAllPayments
);

module.exports = router;
