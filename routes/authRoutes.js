const express = require('express');
const router = express.Router();

const { register, login, logout, forgotpassword,forgotpasswordLink } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/reset-password-link', forgotpasswordLink);
router.post('/forgot-password', forgotpassword);

module.exports = router;
