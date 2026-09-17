const crypto = require("crypto");
const User = require("../user/user.model");
const CustomError = require("../../errors");
const {
   attachCookiesToResponse,
   createTokenUser,
   forgotPasswordEmail,
} = require("../../utils");

const register = async ({ email, name, password, res }) => {
   const emailAlreadyExists = await User.findOne({ where: { email } });
   if (emailAlreadyExists) {
      throw new CustomError.BadRequestError("Email already exists");
   }

   const isFirstAccount = (await User.count()) === 0;
   const role = isFirstAccount ? "admin" : "user";
   const user = await User.create({ name, email, password, role });
   const tokenUser = createTokenUser(user);
   if (res) {
      attachCookiesToResponse({ res, user: tokenUser });
   }
   return tokenUser;
};

const login = async ({ email, password, res }) => {
   if (!email || !password) {
      throw new CustomError.BadRequestError(
         "Please provide email and password"
      );
   }

   const user = await User.findOne({ where: { email } });
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
   return tokenUser;
};

const logout = (res) => {
   res.cookie("token", "logout", {
      httpOnly: true,
      expires: new Date(Date.now()),
      maxAge: 0,
      secure: false,
      signed: true,
      sameSite: "lax",
      path: "/",
   });
};

const forgotpasswordLink = async ({ email }) => {
   if (!email) {
      throw new CustomError.BadRequestError("Please provide valid email");
   }

   const user = await User.findOne({ where: { email } });
   if (!user) {
      throw new CustomError.BadRequestError(`No user with username : ${email}`);
   }

   const passwordToken = crypto.randomBytes(8).toString("hex");
   const tenMinutes = 1000 * 60 * 10;
   user.passwordToken = passwordToken;
   user.passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
   await user.save();

   await forgotPasswordEmail(user.name, email, passwordToken);
};

const forgotpassword = async ({ token, email, password }) => {
   if (!token || !email || !password) {
      throw new CustomError.BadRequestError("Please provide all values");
   }

   const user = await User.findOne({ where: { email } });
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
};

module.exports = {
   register,
   login,
   logout,
   forgotpassword,
   forgotpasswordLink,
};
