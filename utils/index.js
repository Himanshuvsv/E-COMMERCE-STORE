const { createJWT, isTokenValid, attachCookiesToResponse } = require("./jwt");
const createTokenUser = require("./createTokenUser");
const checkPermissions = require("./checkPermissions");
const forgotPasswordEmail = require("./forgotpasswordEmail");
const paymentEmail = require("./paymentEmail");
module.exports = {
   createJWT,
   isTokenValid,
   attachCookiesToResponse,
   createTokenUser,
   checkPermissions,
   forgotPasswordEmail,
   paymentEmail,
};
