
module.exports = {
   table: {
      orders: [
         "createdAt-timestamptz-0-brin",
         "updatedAt-timestamptz-0-brin",
         "subtotal-numeric-0-btree",
         "shippingFee-numeric-0-btree",
         "total-numeric-0-btree",
         "status-varchar(20)-1-btree",
         "paymentStatus-varchar(20)-1-btree",
         "paymentIntentId-varchar(255)-0-btree",
         "userId-uuid-1-btree",
      ],
      order_items: [
         "createdAt-timestamptz-0-brin",
         "updatedAt-timestamptz-0-brin",
         "orderId-uuid-1-btree",
         "productId-uuid-1-btree",
         "name-varchar(255)-1-btree",
         "description-text-0-0",
         "category-varchar(50)-1-btree",
         "price-numeric-1-btree",
         "image-varchar(255)-1-0",
         "quantity-integer-1-btree",
      ],
   },
};
