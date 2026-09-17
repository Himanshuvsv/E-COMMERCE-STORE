const { StatusCodes } = require("http-status-codes");
const { ValidationError, UniqueConstraintError, DatabaseError } = require("sequelize");

const errorHandlerMiddleware = (err, req, res, next) => {
   let customError = {
      statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
      msg: err.message || "Something went wrong try again later",
   };

   if (err instanceof ValidationError) {
      customError.msg = err.errors.map((item) => item.message).join(",");
      customError.statusCode = 400;
   }

   if (err instanceof UniqueConstraintError) {
      const fields = Object.keys(err.fields || {});
      customError.msg = `Duplicate value entered for ${
         fields.join(", ") || "field"
      } field, please choose another value`;
      customError.statusCode = 400;
   }

   if (
      err.name === "SequelizeDatabaseError" ||
      err instanceof DatabaseError
   ) {
      if (err.message && err.message.toLowerCase().includes("invalid input syntax for type uuid")) {
         customError.msg = `No item found with id : ${err.message}`;
         customError.statusCode = 404;
      }
   }

   return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
