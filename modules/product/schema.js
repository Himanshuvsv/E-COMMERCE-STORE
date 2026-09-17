/**
 * Column format: "name-type-notNull-index"
 * notNull: 1 = NOT NULL, 0 = nullable
 * index: btree | brin | unique | 0
 */
module.exports = {
   table: {
      products: [
         "createdAt-timestamptz-0-brin",
         "updatedAt-timestamptz-0-brin",
         "name-varchar(100)-1-btree",
         "price-numeric-1-btree",
         "description-varchar(1000)-1-0",
         "image-varchar(255)-0-0",
         "category-varchar(20)-1-btree",
         "company-varchar(20)-1-btree",
         "colors-jsonb-1-0",
         "featured-boolean-0-btree",
         "freeShipping-boolean-0-btree",
         "inventory-integer-1-btree",
         "averageRating-numeric-0-btree",
         "numOfReviews-integer-0-btree",
         "userId-uuid-1-btree",
         "isDeleted-boolean-0-btree",
      ],
   },
};
