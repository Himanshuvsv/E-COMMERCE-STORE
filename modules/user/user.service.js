const User = require("./user.model");
const CustomError = require("../../errors");
const {
   createTokenUser,
   attachCookiesToResponse,
   checkPermissions,
} = require("../../utils");

const getAllUsers = async () => {
   return User.findAll({
      where: { role: "user" },
      attributes: { exclude: ["password"] },
   });
};

const getSingleUser = async ({ id, requestUser }) => {
   const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
   });
   if (!user) {
      throw new CustomError.NotFoundError(`No user with id : ${id}`);
   }
   checkPermissions(requestUser, user.id);
   return user;
};

const showCurrentUser = async (userId) => {
   return User.findByPk(userId);
};

const updateUser = async ({ userId, email, name, res }) => {
   if (!email || !name) {
      throw new CustomError.BadRequestError("Please provide all values");
   }

   const user = await User.findByPk(userId);
   user.email = email;
   user.name = name;
   await user.save();

   const tokenUser = createTokenUser(user);
   attachCookiesToResponse({ res, user: tokenUser });
   return tokenUser;
};

const updateUserPassword = async ({ userId, oldPassword, newPassword }) => {
   if (!oldPassword || !newPassword) {
      throw new CustomError.BadRequestError("Please provide both values");
   }

   const user = await User.findByPk(userId);
   const isPasswordCorrect = await user.comparePassword(oldPassword);
   if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
   }

   user.password = newPassword;
   await user.save();
};

module.exports = {
   getAllUsers,
   getSingleUser,
   showCurrentUser,
   updateUser,
   updateUserPassword,
};
