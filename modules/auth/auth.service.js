const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sql, sqlOne, withCompat } = require("../../db/query");
const CustomError = require("../../errors");
const {
   createTokenResponse,
   createTokenUser,
   forgotPasswordEmail,
} = require("../../utils");

const hashPassword = async (password) => {
   const salt = await bcrypt.genSalt(10);
   return bcrypt.hash(password, salt);
};

const register = async ({ email, name, password }) => {
   const existing = await sqlOne(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [email]
   );
   if (existing) {
      throw new CustomError.BadRequestError("Email already exists");
   }

   const countRow = await sqlOne(`SELECT COUNT(*)::int AS count FROM users`);
   const role = countRow.count === 0 ? "admin" : "user";
   const hashed = await hashPassword(password);

   const user = await sqlOne(
      `INSERT INTO users (id, name, email, password, role, "walletBalance", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, 0, NOW(), NOW())
       RETURNING id, name, email, role, "walletBalance", "createdAt", "updatedAt"`,
      [name, email, hashed, role]
   );

   return createTokenResponse({ user: createTokenUser(withCompat(user)) });
};

const login = async ({ email, password }) => {
   if (!email || !password) {
      throw new CustomError.BadRequestError(
         "Please provide email and password"
      );
   }

   const user = await sqlOne(
      `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      [email]
   );
   if (!user) {
      throw new CustomError.UnauthenticatedError(
         "User Not Found ! please provide correct User name"
      );
   }

   const isPasswordCorrect = await bcrypt.compare(password, user.password);
   if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError("Invalid Password");
   }

   return createTokenResponse({
      user: createTokenUser(withCompat(user)),
   });
};

const logout = () => {
   return { msg: "user logged out" };
};

const forgotpasswordLink = async ({ email }) => {
   if (!email) {
      throw new CustomError.BadRequestError("Please provide valid email");
   }

   const user = await sqlOne(
      `SELECT id, name, email FROM users WHERE email = $1 LIMIT 1`,
      [email]
   );
   if (!user) {
      throw new CustomError.BadRequestError(`No user with username : ${email}`);
   }

   const passwordToken = crypto.randomBytes(8).toString("hex");
   const tenMinutes = new Date(Date.now() + 1000 * 60 * 10);

   await sql(
      `UPDATE users
       SET "passwordToken" = $1,
           "passwordTokenExpirationDate" = $2,
           "updatedAt" = NOW()
       WHERE id = $3`,
      [passwordToken, tenMinutes, user.id]
   );

   await forgotPasswordEmail(user.name, email, passwordToken);
};

const forgotpassword = async ({ token, email, password }) => {
   if (!token || !email || !password) {
      throw new CustomError.BadRequestError("Please provide all values");
   }

   const user = await sqlOne(
      `SELECT * FROM users WHERE email = $1 LIMIT 1`,
      [email]
   );
   if (!user) {
      throw new CustomError.NotFoundError("User not found");
   }

   if (
      user.passwordToken !== token ||
      !user.passwordTokenExpirationDate ||
      new Date(user.passwordTokenExpirationDate) <= new Date()
   ) {
      throw new CustomError.UnauthorizedError("Invalid or expired token");
   }

   const hashed = await hashPassword(password);
   await sql(
      `UPDATE users
       SET password = $1,
           "passwordToken" = NULL,
           "passwordTokenExpirationDate" = NULL,
           "updatedAt" = NOW()
       WHERE id = $2`,
      [hashed, user.id]
   );
};

module.exports = {
   register,
   login,
   logout,
   forgotpassword,
   forgotpasswordLink,
};
