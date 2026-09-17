
module.exports = {
   table: {
      payments: [
         "createdAt-timestamptz-0-brin",
         "updatedAt-timestamptz-0-brin",
         "userId-uuid-1-btree",
         "paymentIntentId-varchar(255)-1-btree",
         "clientSecret-varchar(255)-1-0",
         "amount-numeric-1-btree",
         "currency-varchar(10)-0-btree",
         "status-varchar(20)-0-btree",
         "refundedDate-timestamptz-0-btree",
      ],
   },
};
