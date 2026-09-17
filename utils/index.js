const { createJWT, isTokenValid, createTokenResponse } = require("./jwt");
const createTokenUser = require("./createTokenUser");
const checkPermissions = require("./checkPermissions");
const forgotPasswordEmail = require("./forgotpasswordEmail");
const paymentEmail = require("./paymentEmail");

module.exports = {
   createJWT,
   isTokenValid,
   createTokenResponse,
   createTokenUser,
   checkPermissions,
   forgotPasswordEmail,
   paymentEmail,
};
