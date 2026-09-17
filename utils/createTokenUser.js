const createTokenUser = (user) => {
   return {
      name: user.name,
      userId: user.id || user._id,
      role: user.role,
      email: user.email,
   };
};

module.exports = createTokenUser;
