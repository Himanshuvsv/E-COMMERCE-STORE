/**
 * Column format: "name-type-notNull-index"
 * notNull: 1 = NOT NULL, 0 = nullable
 * index: btree | brin | unique | 0
 */
module.exports = {
   table: {
      reviews: [
         "createdAt-timestamptz-0-brin",
         "updatedAt-timestamptz-0-brin",
         "rating-integer-1-btree",
         "title-varchar(100)-1-0",
         "comment-text-1-0",
         "userId-uuid-1-btree",
         "productId-uuid-1-btree",
      ],
   },
};
