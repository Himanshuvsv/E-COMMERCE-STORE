
module.exports = {
   table: {
      users: [
         "createdAt-timestamptz-0-brin",
         "updatedAt-timestamptz-0-brin",
         "name-varchar(50)-1-btree",
         "email-varchar(255)-1-unique",
         "password-varchar(255)-1-0",
         "role-varchar(20)-1-btree",
         "passwordToken-varchar(255)-0-btree",
         "passwordTokenExpirationDate-timestamptz-0-btree",
         "walletBalance-numeric-0-btree",
      ],
   },
};
