const bcrypt = require("bcryptjs");
const { sql, sqlOne, withCompat, withCompatMany } = require("../../db/query");
const CustomError = require("../../errors");
const {
   createTokenUser,
   createTokenResponse,
   checkPermissions,
} = require("../../utils");

const getAllUsers = async () => {
   const users = await sql(
      `SELECT id, name, email, role, "walletBalance", "createdAt", "updatedAt"
       FROM users
       WHERE role = 'user'
       ORDER BY "createdAt" DESC`
   );
   return withCompatMany(users);
};

const getSingleUser = async ({ id, requestUser }) => {
   const user = await sqlOne(
      `SELECT id, name, email, role, "walletBalance", "createdAt", "updatedAt"
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [id]
   );
   if (!user) {
      throw new CustomError.NotFoundError(`No user with id : ${id}`);
   }
   checkPermissions(requestUser, user.id);
   return withCompat(user);
};

const showCurrentUser = async (userId) => {
   const user = await sqlOne(
      `SELECT id, name, email, role, "walletBalance", "createdAt", "updatedAt", password
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [userId]
   );
   return user ? withCompat(user) : null;
};

const updateUser = async ({ userId, email, name }) => {
   if (!email || !name) {
      throw new CustomError.BadRequestError("Please provide all values");
   }

   const user = await sqlOne(
      `UPDATE users
       SET name = $1, email = $2, "updatedAt" = NOW()
       WHERE id = $3
       RETURNING id, name, email, role, "walletBalance", "createdAt", "updatedAt"`,
      [name, email, userId]
   );
   if (!user) {
      throw new CustomError.NotFoundError(`No user with id : ${userId}`);
   }

   return createTokenResponse({ user: createTokenUser(withCompat(user)) });
};

const updateUserPassword = async ({ userId, oldPassword, newPassword }) => {
   if (!oldPassword || !newPassword) {
      throw new CustomError.BadRequestError("Please provide both values");
   }

   const user = await sqlOne(
      `SELECT id, password FROM users WHERE id = $1 LIMIT 1`,
      [userId]
   );
   if (!user) {
      throw new CustomError.NotFoundError(`No user with id : ${userId}`);
   }

   const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
   if (!isPasswordCorrect) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
   }

   const salt = await bcrypt.genSalt(10);
   const hashed = await bcrypt.hash(newPassword, salt);

   await sql(
      `UPDATE users
       SET password = $1, "updatedAt" = NOW()
       WHERE id = $2`,
      [hashed, userId]
   );
};

module.exports = {
   getAllUsers,
   getSingleUser,
   showCurrentUser,
   updateUser,
   updateUserPassword,
};
