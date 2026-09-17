const { DataTypes } = require("sequelize");
const sequelize = require("../../db/sequelize");
const applyApiCompat = require("../../utils/modelCompat");

const OrderItem = sequelize.define(
   "OrderItem",
   {
      id: {
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
         primaryKey: true,
      },
      orderId: {
         type: DataTypes.UUID,
         allowNull: false,
      },
      productId: {
         type: DataTypes.UUID,
         allowNull: false,
      },
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      description: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
      category: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      price: {
         type: DataTypes.FLOAT,
         allowNull: false,
      },
      image: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      quantity: {
         type: DataTypes.INTEGER,
         defaultValue: 1,
      },
   },
   {
      tableName: "order_items",
      timestamps: true,
   }
);

applyApiCompat(OrderItem);

module.exports = OrderItem;
