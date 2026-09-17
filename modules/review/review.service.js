const { fn, col } = require("sequelize");
const Review = require("./review.model");
const Product = require("../product/product.model");
const User = require("../user/user.model");
const CustomError = require("../../errors");
const { checkPermissions } = require("../../utils");

const calculateAverageRating = async (productId) => {
   const result = await Review.findOne({
      where: { productId },
      attributes: [
         [fn("AVG", col("rating")), "averageRating"],
         [fn("COUNT", col("id")), "numOfReviews"],
      ],
      raw: true,
   });

   await Product.update(
      {
         averageRating: Math.ceil(Number(result?.averageRating) || 0),
         numOfReviews: Number(result?.numOfReviews) || 0,
      },
      { where: { id: productId } }
   );
};

const createReview = async ({ body, userId }) => {
   const productId = body.product || body.productId;
   const isValidProduct = await Product.findByPk(productId);
   if (!isValidProduct) {
      throw new CustomError.NotFoundError(`No product with id : ${productId}`);
   }

   const alreadySubmitted = await Review.findOne({
      where: { productId, userId },
   });
   if (alreadySubmitted) {
      throw new CustomError.BadRequestError(
         "Already submitted review for this product"
      );
   }

   const review = await Review.create({
      rating: body.rating,
      title: body.title,
      comment: body.comment,
      productId,
      userId,
   });
   await calculateAverageRating(productId);
   return review;
};

const getAllReviews = async () => {
   const reviews = await Review.findAll({
      include: [
         {
            model: Product,
            as: "product",
            attributes: ["id", "name", "company", "price", "image"],
         },
         {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
         },
      ],
   });
   return { reviews, count: reviews.length };
};

const getSingleReview = async (reviewId) => {
   const review = await Review.findByPk(reviewId);
   if (!review) {
      throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
   }
   return review;
};

const updateReview = async ({ reviewId, rating, title, comment, requestUser }) => {
   const review = await Review.findByPk(reviewId);
   if (!review) {
      throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
   }

   checkPermissions(requestUser, review.userId);
   review.rating = rating;
   review.title = title;
   review.comment = comment;
   await review.save();
   await calculateAverageRating(review.productId);
   return review;
};

const deleteReview = async ({ reviewId, requestUser }) => {
   const review = await Review.findByPk(reviewId);
   if (!review) {
      throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
   }

   checkPermissions(requestUser, review.userId);
   const productId = review.productId;
   await review.destroy();
   await calculateAverageRating(productId);
};

const getSingleProductReviews = async (productId) => {
   const reviews = await Review.findAll({
      where: { productId },
      include: [{ model: User, as: "user" }],
   });
   return { reviews, count: reviews.length };
};

module.exports = {
   createReview,
   getAllReviews,
   getSingleReview,
   updateReview,
   deleteReview,
   getSingleProductReviews,
};
