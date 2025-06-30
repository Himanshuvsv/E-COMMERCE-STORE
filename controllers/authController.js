const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
   attachCookiesToResponse,
   createTokenUser,
   forgotPasswordEmail,
} = require("../utils");
const crypto = require("crypto");

const register = async (req, res) => {
   try {
      const { email, name, password } = req.body;
      const emailAlreadyExists = await User.findOne({ email });
      if (emailAlreadyExists) {
         throw new CustomError.BadRequestError("Email already exists");
      }
      const isFirstAccount = (await User.countDocuments({})) === 0;
      const role = isFirstAccount ? "admin" : "user";
      const user = await User.create({ name, email, password, role });
      const tokenUser = createTokenUser(user);
      res.status(StatusCodes.CREATED).json({ user: tokenUser });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const login = async (req, res) => {
   try {
      const { email, password } = req.body;

      if (!email || !password) {
         throw new CustomError.BadRequestError(
            "Please provide email and password"
         );
      }

      const user = await User.findOne({ email });

      if (!user) {
         throw new CustomError.UnauthenticatedError(
            "User Not Found ! please provide correct User name"
         );
      }
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) {
         throw new CustomError.UnauthenticatedError("Invalid Password");
      }

      const tokenUser = createTokenUser(user);

      attachCookiesToResponse({ res, user: tokenUser });

      res.status(StatusCodes.OK).json({ user: tokenUser });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const logout = async (req, res) => {
   try {
      res.cookie("token", "logout", {
         httpOnly: true,
         expires: new Date(Date.now() + 1000),
      });

      res.status(StatusCodes.OK).json({ msg: "user logged out!" });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const forgotpasswordLink = async (req, res) => {
   try {
      const { email } = req.body;
      if (!email) {
         throw new CustomError.BadRequestError("Please provide valid email");
      }
      const user = await User.findOne({ email });

      if (!user) {
         throw new CustomError.BadRequestError(
            `No user with username : ${email}`
         );
      }

      const name = user.name;
      const passwordToken = crypto.randomBytes(8).toString("hex");
      const tenMinutes = 1000 * 60 * 10;
      const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
      user.passwordToken = passwordToken;
      user.passwordTokenExpirationDate = passwordTokenExpirationDate;
      await user.save();

      await forgotPasswordEmail(name, email, passwordToken);

      res.status(StatusCodes.OK).json({
         msg: "Please check your email for reset password link",
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const forgotpassword = async (req, res) => {
   try {
      const { token, email, password } = req.body;

      if (!token || !email || !password) {
         throw new CustomError.BadRequestError("Please provide all values");
      }

      const user = await User.findOne({ email });
      if (!user) {
         throw new CustomError.NotFoundError("User not found");
      }

      const currentDate = new Date();

      if (
         user.passwordToken !== token ||
         user.passwordTokenExpirationDate <= currentDate
      ) {
         throw new CustomError.UnauthorizedError("Invalid or expired token");
      }

      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();

      res.status(StatusCodes.OK).json({ msg: "Password reset successful!" });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

module.exports = {
   register,
   login,
   logout,
   forgotpassword,
   forgotpasswordLink,
};
