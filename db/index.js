const sequelize = require("./sequelize");
const { syncSchema } = require("./syncSchema");

const shouldCreateSchema = () => {
   const value = String(process.env.RUN_CREATE_SCHEMA_DB || "false")
      .trim()
      .toLowerCase();
   return value === "true" || value === "1" || value === "yes";
};

const connectDB = async () => {
   await sequelize.authenticate();
   console.log("[db] connected");

   if (shouldCreateSchema()) {
      await syncSchema();
   } else {
      console.log(
         "[schema] RUN_CREATE_SCHEMA_DB=false — skipping schema sync"
      );
   }
};

module.exports = { sequelize, connectDB, shouldCreateSchema };
