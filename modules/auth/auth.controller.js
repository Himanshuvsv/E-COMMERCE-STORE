const { StatusCodes } = require("http-status-codes");
const authService = require("./auth.service");

const register = async (req, res) => {
   try {
      const user = await authService.register({ ...req.body, res });
      res.status(StatusCodes.CREATED).json({ user });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const login = async (req, res) => {
   try {
      const user = await authService.login({ ...req.body, res });
      res.status(StatusCodes.OK).json({ user });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const logout = async (req, res) => {
   try {
      authService.logout(res);
      res.status(StatusCodes.OK).json({ msg: "user logged out!" });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const forgotpasswordLink = async (req, res) => {
   try {
      await authService.forgotpasswordLink(req.body);
      res.status(StatusCodes.OK).json({
         msg: "Please check your email for reset password link",
      });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const forgotpassword = async (req, res) => {
   try {
      await authService.forgotpassword(req.body);
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
