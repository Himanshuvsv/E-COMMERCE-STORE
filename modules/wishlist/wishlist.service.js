const { sql, sqlOne, withCompat, withCompatMany } = require("../../db/query");
const CustomError = require("../../errors");

const addItemToWishlist = async ({ userId, productId }) => {
   const product = await sqlOne(
      `SELECT id FROM products WHERE id = $1 LIMIT 1`,
      [productId]
   );
   if (!product) {
      throw new CustomError.NotFoundError("Product not found");
   }

   const existing = await sqlOne(
      `SELECT id FROM wishlists
       WHERE "userId" = $1 AND "productId" = $2
       LIMIT 1`,
      [userId, productId]
   );
   if (existing) {
      throw new CustomError.BadRequestError("Product already in wishlist");
   }

   const item = await sqlOne(
      `INSERT INTO wishlists (id, "userId", "productId", "addedOn", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, NOW(), NOW(), NOW())
       RETURNING *`,
      [userId, productId]
   );
   return withCompat(item);
};

const getWishlistItems = async (userId) => {
   const items = await sql(
      `SELECT
         w.*,
         CASE
           WHEN p.id IS NULL THEN NULL
           ELSE json_build_object(
             'id', p.id,
             '_id', p.id,
             'name', p.name,
             'price', p.price,
             'image', p.image,
             'category', p.category,
             'description', p.description,
             'averageRating', p."averageRating",
             'numOfReviews', p."numOfReviews",
             'inventory', p.inventory
           )
         END AS product
       FROM wishlists w
       LEFT JOIN products p ON p.id = w."productId"
       WHERE w."userId" = $1
       ORDER BY w."addedOn" DESC`,
      [userId]
   );
   return withCompatMany(items);
};

const removeItemFromWishlist = async ({ wishlistId, userId }) => {
   const deleted = await sql(
      `DELETE FROM wishlists
       WHERE id = $1 AND "userId" = $2
       RETURNING id`,
      [wishlistId, userId]
   );
   if (!deleted.length) {
      throw new CustomError.NotFoundError(
         `No item with ID ${wishlistId} in your wishlist`
      );
   }
};

module.exports = {
   addItemToWishlist,
   getWishlistItems,
   removeItemFromWishlist,
};
