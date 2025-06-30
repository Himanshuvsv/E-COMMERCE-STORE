const express = require("express");

const {
   createPaymentIntent,
   processRefund,
   getPaymentHistory,
   getAllPayments,
} = require("../controllers/paymentController");
const { authenticateUser, authorizePermissions } = require("../middleware/authentication");
const router = express.Router();

router.post("/create-payment-intent", authenticateUser, createPaymentIntent);
router.post("/payment-refund/:id", authenticateUser, processRefund);
router.get("/paymentHistory", authenticateUser, getPaymentHistory);
router.get("/", authenticateUser, authorizePermissions('admin'), getAllPayments)

module.exports = router;
