const { sql, sqlOne, withCompat, withCompatMany } = require("../../db/query");
const CustomError = require("../../errors");
const { checkPermissions } = require("../../utils");

const calculateAverageRating = async (productId) => {
   const result = await sqlOne(
      `SELECT
         COALESCE(CEIL(AVG(rating)), 0)::float AS "averageRating",
         COUNT(*)::int AS "numOfReviews"
       FROM reviews
       WHERE "productId" = $1`,
      [productId]
   );

   await sql(
      `UPDATE products
       SET "averageRating" = $1,
           "numOfReviews" = $2,
           "updatedAt" = NOW()
       WHERE id = $3`,
      [
         Number(result?.averageRating) || 0,
         Number(result?.numOfReviews) || 0,
         productId,
      ]
   );
};

const createReview = async ({ body, userId }) => {
   const productId = body.product || body.productId;
   const product = await sqlOne(
      `SELECT id FROM products WHERE id = $1 LIMIT 1`,
      [productId]
   );
   if (!product) {
      throw new CustomError.NotFoundError(`No product with id : ${productId}`);
   }

   const alreadySubmitted = await sqlOne(
      `SELECT id FROM reviews
       WHERE "productId" = $1 AND "userId" = $2
       LIMIT 1`,
      [productId, userId]
   );
   if (alreadySubmitted) {
      throw new CustomError.BadRequestError(
         "Already submitted review for this product"
      );
   }

   const review = await sqlOne(
      `INSERT INTO reviews (
         id, rating, title, comment, "userId", "productId", "createdAt", "updatedAt"
       ) VALUES (
         gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()
       )
       RETURNING *`,
      [body.rating, body.title, body.comment, userId, productId]
   );

   await calculateAverageRating(productId);
   return withCompat(review);
};

const getAllReviews = async () => {
   const reviews = await sql(
      `SELECT
         r.*,
         json_build_object(
           'id', p.id,
           '_id', p.id,
           'name', p.name,
           'company', p.company,
           'price', p.price,
           'image', p.image
         ) AS product,
         json_build_object(
           'id', u.id,
           '_id', u.id,
           'name', u.name,
           'email', u.email
         ) AS "user"
       FROM reviews r
       JOIN products p ON p.id = r."productId"
       JOIN users u ON u.id = r."userId"
       ORDER BY r."createdAt" DESC`
   );

   const mapped = withCompatMany(reviews);
   return { reviews: mapped, count: mapped.length };
};

const getSingleReview = async (reviewId) => {
   const review = await sqlOne(
      `SELECT * FROM reviews WHERE id = $1 LIMIT 1`,
      [reviewId]
   );
   if (!review) {
      throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
   }
   return withCompat(review);
};

const updateReview = async ({
   reviewId,
   rating,
   title,
   comment,
   requestUser,
}) => {
   const review = await sqlOne(
      `SELECT * FROM reviews WHERE id = $1 LIMIT 1`,
      [reviewId]
   );
   if (!review) {
      throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
   }

   checkPermissions(requestUser, review.userId);

   const updated = await sqlOne(
      `UPDATE reviews
       SET rating = $1,
           title = $2,
           comment = $3,
           "updatedAt" = NOW()
       WHERE id = $4
       RETURNING *`,
      [rating, title, comment, reviewId]
   );

   await calculateAverageRating(review.productId);
   return withCompat(updated);
};

const deleteReview = async ({ reviewId, requestUser }) => {
   const review = await sqlOne(
      `SELECT * FROM reviews WHERE id = $1 LIMIT 1`,
      [reviewId]
   );
   if (!review) {
      throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
   }

   checkPermissions(requestUser, review.userId);
   const productId = review.productId;
   await sql(`DELETE FROM reviews WHERE id = $1`, [reviewId]);
   await calculateAverageRating(productId);
};

const getSingleProductReviews = async (productId) => {
   const reviews = await sql(
      `SELECT
         r.*,
         json_build_object(
           'id', u.id,
           '_id', u.id,
           'name', u.name,
           'email', u.email
         ) AS "user"
       FROM reviews r
       JOIN users u ON u.id = r."userId"
       WHERE r."productId" = $1
       ORDER BY r."createdAt" DESC`,
      [productId]
   );
   const mapped = withCompatMany(reviews);
   return { reviews: mapped, count: mapped.length };
};

module.exports = {
   createReview,
   getAllReviews,
   getSingleReview,
   updateReview,
   deleteReview,
   getSingleProductReviews,
};
