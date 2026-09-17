const { DataTypes } = require("sequelize");
const sequelize = require("../../db/sequelize");
const applyApiCompat = require("../../utils/modelCompat");

const Wishlist = sequelize.define(
   "Wishlist",
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
      productId: {
         type: DataTypes.UUID,
         allowNull: false,
      },
      addedOn: {
         type: DataTypes.DATE,
         defaultValue: DataTypes.NOW,
      },
   },
   {
      tableName: "wishlists",
      timestamps: true,
   }
);

applyApiCompat(Wishlist);

module.exports = Wishlist;
