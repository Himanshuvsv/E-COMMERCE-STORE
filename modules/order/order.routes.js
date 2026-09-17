const express = require("express");
const router = express.Router();
const {
   authenticateUser,
   authorizePermissions,
} = require("../../middleware/authentication");
const {
   getAllOrders,
   getSingleOrder,
   getCurrentUserOrders,
   createOrder,
   updateOrder,
   cancelOrder,
   deleteOrder,
   getDashboardStats,
} = require("./order.controller");

router.post("/", authenticateUser, createOrder);
router.get("/", authenticateUser, authorizePermissions("admin"), getAllOrders);
router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrders);
router
   .route("/dashbordData")
   .get(authenticateUser, authorizePermissions("admin"), getDashboardStats);
router
   .route("/:id")
   .get(authenticateUser, getSingleOrder)
   .patch(authenticateUser, updateOrder)
   .delete(authenticateUser, deleteOrder);
router.route("/cancelOrder/:id").post(authenticateUser, cancelOrder);

module.exports = router;
