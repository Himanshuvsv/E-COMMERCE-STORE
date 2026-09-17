const { sql, sqlOne, withCompat, withCompatMany } = require("../../db/query");
const CustomError = require("../../errors");

const addItemToCart = async ({ userId, productId, quantity }) => {
   const product = await sqlOne(
      `SELECT * FROM products WHERE id = $1 LIMIT 1`,
      [productId]
   );
   if (!product) {
      throw new CustomError.NotFoundError("Product not found");
   }

   const imagePath = String(product.image || "").replace(
      /^https?:\/\/[^/]+/,
      ""
   );
   const qty = quantity || 1;

   const existing = await sqlOne(
      `SELECT * FROM carts
       WHERE "productId" = $1 AND "userId" = $2
       LIMIT 1`,
      [productId, userId]
   );

   if (existing) {
      const item = await sqlOne(
         `UPDATE carts
          SET quantity = quantity + $1, "updatedAt" = NOW()
          WHERE id = $2
          RETURNING *`,
         [qty, existing.id]
      );
      return { item: withCompat(item), created: false };
   }

   const cartItem = await sqlOne(
      `INSERT INTO carts (
         id, "productId", name, description, category, price, image,
         quantity, "userId", "createdAt", "updatedAt"
       ) VALUES (
         gen_random_uuid(), $1, $2, $3, $4, $5,
         $6, $7, $8, NOW(), NOW()
       )
       RETURNING *`,
      [
         productId,
         product.name,
         product.description,
         product.category,
         product.price,
         imagePath,
         qty,
         userId,
      ]
   );

   return { item: withCompat(cartItem), created: true };
};

const getCartItemUser = async (userId) => {
   const items = await sql(
      `SELECT
         c.*,
         CASE
           WHEN p.id IS NULL THEN NULL
           ELSE json_build_object(
             'id', p.id,
             '_id', p.id,
             'name', p.name,
             'price', p.price,
             'image', p.image,
             'category', p.category,
             'inventory', p.inventory
           )
         END AS product
       FROM carts c
       LEFT JOIN products p ON p.id = c."productId"
       WHERE c."userId" = $1
       ORDER BY c."createdAt" DESC`,
      [userId]
   );
   return withCompatMany(items);
};

const removeItemFromCart = async ({ itemId, userId }) => {
   const deleted = await sql(
      `DELETE FROM carts
       WHERE id = $1 AND "userId" = $2
       RETURNING id`,
      [itemId, userId]
   );
   if (!deleted.length) {
      throw new CustomError.NotFoundError(
         `No product with id ${itemId} found in your cart`
      );
   }
};

module.exports = {
   addItemToCart,
   getCartItemUser,
   removeItemFromCart,
};
