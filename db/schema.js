const userSchema = require("../modules/user/schema");
const productSchema = require("../modules/product/schema");
const orderSchema = require("../modules/order/schema");
const cartSchema = require("../modules/cart/schema");
const wishlistSchema = require("../modules/wishlist/schema");
const reviewSchema = require("../modules/review/schema");
const paymentSchema = require("../modules/payment/schema");

/**
 * Aggregated store schema from module `schema.js` files.
 * Column format: "name-type-notNull-index"
 * - notNull: 1 = NOT NULL, 0 = nullable
 * - index: btree | brin | unique | 0 (no index)
 * Primary key `id uuid` is added by sync if missing.
 */
const storeSchema = {
   table: {
      ...userSchema.table,
      ...productSchema.table,
      ...orderSchema.table,
      ...cartSchema.table,
      ...wishlistSchema.table,
      ...reviewSchema.table,
      ...paymentSchema.table,
   },
};

/** Parse "name-type-notNull-index" (type may contain parentheses, e.g. varchar(32)). */
const parseColumn = (spec) => {
   const parts = String(spec).split("-");
   if (parts.length < 4) {
      throw new Error(`Invalid column spec: ${spec}`);
   }
   const indexType = parts.pop();
   const notNull = parts.pop();
   const type = parts.pop();
   const name = parts.join("-");
   return {
      name,
      type,
      notNull: notNull === "1",
      indexType: indexType === "0" ? null : indexType,
   };
};

const quoteIdent = (name) => `"${String(name).replace(/"/g, '""')}"`;

module.exports = {
   storeSchema,
   parseColumn,
   quoteIdent,
};
