const { DataTypes } = require("sequelize");
const sequelize = require("../../db/sequelize");
const applyApiCompat = require("../../utils/modelCompat");

const Review = sequelize.define(
   "Review",
   {
      id: {
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
         primaryKey: true,
      },
      rating: {
         type: DataTypes.INTEGER,
         allowNull: false,
         validate: {
            min: 1,
            max: 5,
         },
      },
      title: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
      comment: {
         type: DataTypes.TEXT,
         allowNull: false,
      },
      userId: {
         type: DataTypes.UUID,
         allowNull: false,
      },
      productId: {
         type: DataTypes.UUID,
         allowNull: false,
      },
   },
   {
      tableName: "reviews",
      timestamps: true,
      indexes: [
         {
            unique: true,
            fields: ["userId", "productId"],
         },
      ],
   }
);

applyApiCompat(Review);

module.exports = Review;
