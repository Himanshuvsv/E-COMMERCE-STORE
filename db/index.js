const sequelize = require("./sequelize");

const connectDB = async () => {
   await sequelize.authenticate();
   require("./associations");
   await sequelize.sync({ alter: true });
};

module.exports = { sequelize, connectDB };
