const { DataTypes } = require("sequelize");
const sequelize = require("../../db/sequelize");
const applyApiCompat = require("../../utils/modelCompat");

const Order = sequelize.define(
   "Order",
   {
      id: {
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
         primaryKey: true,
      },
      subtotal: {
         type: DataTypes.FLOAT,
         allowNull: true,
      },
      shippingFee: {
         type: DataTypes.FLOAT,
         allowNull: true,
      },
      total: {
         type: DataTypes.FLOAT,
         allowNull: true,
      },
      status: {
         type: DataTypes.ENUM(
            "pending",
            "canceled",
            "failed",
            "delivered",
            "shipped",
            "processing"
         ),
         defaultValue: "pending",
      },
      paymentStatus: {
         type: DataTypes.ENUM("pending", "paid", "refunded"),
         defaultValue: "pending",
      },
      paymentIntentId: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      userId: {
         type: DataTypes.UUID,
         allowNull: false,
      },
   },
   {
      tableName: "orders",
      timestamps: true,
   }
);

applyApiCompat(Order);

module.exports = Order;
