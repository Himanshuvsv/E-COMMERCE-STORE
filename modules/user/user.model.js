const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const sequelize = require("../../db/sequelize");
const applyApiCompat = require("../../utils/modelCompat");

const User = sequelize.define(
   "User",
   {
      id: {
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV4,
         primaryKey: true,
      },
      name: {
         type: DataTypes.STRING(50),
         allowNull: false,
         validate: {
            len: [3, 50],
         },
      },
      email: {
         type: DataTypes.STRING,
         allowNull: false,
         unique: true,
         validate: {
            isEmailValidator(value) {
               if (!validator.isEmail(value)) {
                  throw new Error("Please provide valid email");
               }
            },
         },
      },
      password: {
         type: DataTypes.STRING,
         allowNull: false,
         validate: {
            len: [6, 255],
         },
      },
      role: {
         type: DataTypes.ENUM("admin", "user"),
         defaultValue: "user",
      },
      passwordToken: {
         type: DataTypes.STRING,
         allowNull: true,
      },
      passwordTokenExpirationDate: {
         type: DataTypes.DATE,
         allowNull: true,
      },
      walletBalance: {
         type: DataTypes.FLOAT,
         defaultValue: 0,
      },
   },
   {
      tableName: "users",
      timestamps: true,
   }
);

User.beforeSave(async (user) => {
   if (!user.changed("password")) return;
   const salt = await bcrypt.genSalt(10);
   user.password = await bcrypt.hash(user.password, salt);
});

User.prototype.comparePassword = async function comparePassword(candidate) {
   return bcrypt.compare(candidate, this.password);
};

applyApiCompat(User);

module.exports = User;
