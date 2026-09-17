const { DataTypes } = require("sequelize");
const sequelize = require("../../db/sequelize");
const applyApiCompat = require("../../utils/modelCompat");

const Payment = sequelize.define(
   "Payment",
   {
      id: {
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
         primaryKey: true,
      },
      userId: {
         type: DataTypes.UUID,
         allowNull: false,
      },
      paymentIntentId: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      clientSecret: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      amount: {
         type: DataTypes.FLOAT,
         allowNull: false,
      },
      currency: {
         type: DataTypes.STRING,
         defaultValue: "usd",
      },
      status: {
         type: DataTypes.STRING,
         defaultValue: "pending",
      },
      refundedDate: {
         type: DataTypes.DATE,
         allowNull: true,
      },
   },
   {
      tableName: "payments",
      timestamps: true,
   }
);

applyApiCompat(Payment);

module.exports = Payment;
