const { StatusCodes } = require("http-status-codes");
const userService = require("./user.service");

const getAllUsers = async (req, res) => {
   try {
      const users = await userService.getAllUsers();
      res.status(StatusCodes.OK).json({ users });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getSingleUser = async (req, res) => {
   try {
      const user = await userService.getSingleUser({
         id: req.params.id,
         requestUser: req.user,
      });
      res.status(StatusCodes.OK).json({ user });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const showCurrentUser = async (req, res) => {
   try {
      const user = await userService.showCurrentUser(req.user.userId);
      res.status(StatusCodes.OK).json({ user });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const updateUser = async (req, res) => {
   try {
      const { email, name } = req.body;
      const { user, token } = await userService.updateUser({
         userId: req.user.userId,
         email,
         name,
      });
      res.status(StatusCodes.OK).json({ user, token });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const updateUserPassword = async (req, res) => {
   try {
      const { oldPassword, newPassword } = req.body;
      await userService.updateUserPassword({
         userId: req.user.userId,
         oldPassword,
         newPassword,
      });
      res.status(StatusCodes.OK).json({ msg: "Success! Password Updated." });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

module.exports = {
   getAllUsers,
   getSingleUser,
   showCurrentUser,
   updateUser,
   updateUserPassword,
};
