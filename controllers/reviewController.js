const Review = require("../models/Review");
const Product = require("../models/Product");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissions } = require("../utils");

const createReview = async (req, res) => {
   try {
      const { product: productId } = req.body;

      const isValidProduct = await Product.findOne({ _id: productId });

      if (!isValidProduct) {
         throw new CustomError.NotFoundError(
            `No product with id : ${productId}`
         );
      }

      const alreadySubmitted = await Review.findOne({
         product: productId,
         user: req.user.userId,
      });

      if (alreadySubmitted) {
         throw new CustomError.BadRequestError(
            "Already submitted review for this product"
         );
      }

      req.body.user = req.user.userId;
      const review = await Review.create(req.body);
      res.status(StatusCodes.CREATED).json({ review });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getAllReviews = async (req, res) => {
   try {
      const reviews = await Review.find({})
         .populate({
            path: "product",
            select: "name company price image",
         })
         .populate({
            path: "user",
            select: "name email ",
         });

      res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getSingleReview = async (req, res) => {
   try {
      const { id: reviewId } = req.params;

      const review = await Review.findOne({ _id: reviewId });

      if (!review) {
         throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
      }

      res.status(StatusCodes.OK).json({ review });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const updateReview = async (req, res) => {
   try {
      const { id: reviewId } = req.params;
      const { rating, title, comment } = req.body;

      const review = await Review.findOne({ _id: reviewId });

      if (!review) {
         throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
      }

      checkPermissions(req.user, review.user);

      review.rating = rating;
      review.title = title;
      review.comment = comment;

      await review.save();
      res.status(StatusCodes.OK).json({ review });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const deleteReview = async (req, res) => {
   try {
      const { id: reviewId } = req.params;

      const review = await Review.findOne({ _id: reviewId });

      if (!review) {
         throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
      }

      checkPermissions(req.user, review.user);
      await review.remove();
      res.status(StatusCodes.OK).json({ msg: "Success! Review removed" });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

const getSingleProductReviews = async (req, res) => {
   try {
      const { id: productId } = req.params;
      const reviews = await Review.find({ product: productId }).populate(
         "user"
      );
      res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({
         error: error.message,
      });
   }
};

module.exports = {
   createReview,
   getAllReviews,
   getSingleReview,
   updateReview,
   deleteReview,
   getSingleProductReviews,
};
