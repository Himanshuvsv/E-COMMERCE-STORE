const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
   createTokenUser,
   attachCookiesToResponse,
   checkPermissions,
} = require("../utils");

// Get All The Users

const getAllUsers = async (req, res) => {
   try {
      const users = await User.find({ role: "user" }).select("-password");
      res.status(StatusCodes.OK).json({ users });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getSingleUser = async (req, res) => {
   try {
      const user = await User.findOne({ _id: req.params.id }).select(
         "-password"
      );
      if (!user) {
         throw new CustomError.NotFoundError(
            `No user with id : ${req.params.id}`
         );
      }
      checkPermissions(req.user, user._id);
      res.status(StatusCodes.OK).json({ user });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

// Show Current User

const showCurrentUser = async (req, res) => {
   try {
      const user = await User.findOne({ _id: req.user.userId });
      res.status(StatusCodes.OK).json({ user });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

// update user with user.save()
const updateUser = async (req, res) => {
   try {
      const { email, name } = req.body;
      if (!email || !name) {
         throw new CustomError.BadRequestError("Please provide all values");
      }
      const user = await User.findOne({ _id: req.user.userId });

      user.email = email;
      user.name = name;

      await user.save();

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

// Update Password
const updateUserPassword = async (req, res) => {
   try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
         throw new CustomError.BadRequestError("Please provide both values");
      }
      const user = await User.findOne({ _id: req.user.userId });

      const isPasswordCorrect = await user.comparePassword(oldPassword);
      if (!isPasswordCorrect) {
         throw new CustomError.UnauthenticatedError("Invalid Credentials");
      }
      user.password = newPassword;

      await user.save();
      res.status(StatusCodes.OK).json({ msg: "Success! Password Updated." });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

module.exports = {
   getAllUsers,
   getSingleUser,
   showCurrentUser,
   updateUser,
   updateUserPassword,
};
