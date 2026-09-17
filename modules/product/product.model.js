const { DataTypes } = require("sequelize");
const sequelize = require("../../db/sequelize");
const applyApiCompat = require("../../utils/modelCompat");

const Product = sequelize.define(
   "Product",
   {
      id: {
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
         primaryKey: true,
      },
      name: {
         type: DataTypes.STRING(100),
         allowNull: false,
      },
      price: {
         type: DataTypes.FLOAT,
         allowNull: false,
         defaultValue: 0,
      },
      description: {
         type: DataTypes.STRING(1000),
         allowNull: false,
      },
      image: {
         type: DataTypes.STRING,
         defaultValue: "/uploads/example.jpeg",
      },
      category: {
         type: DataTypes.ENUM("office", "kitchen", "bedroom"),
         allowNull: false,
      },
      company: {
         type: DataTypes.ENUM("ikea", "liddy", "marcos"),
         allowNull: false,
      },
      colors: {
         type: DataTypes.JSONB,
         allowNull: false,
         defaultValue: ["#222"],
      },
      featured: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
      },
      freeShipping: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
      },
      inventory: {
         type: DataTypes.INTEGER,
         allowNull: false,
         defaultValue: 15,
      },
      averageRating: {
         type: DataTypes.FLOAT,
         defaultValue: 0,
      },
      numOfReviews: {
         type: DataTypes.INTEGER,
         defaultValue: 0,
      },
      userId: {
         type: DataTypes.UUID,
         allowNull: false,
      },
      isDeleted: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
      },
   },
   {
      tableName: "products",
      timestamps: true,
   }
);

applyApiCompat(Product);

module.exports = Product;
