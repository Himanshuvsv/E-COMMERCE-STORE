const { StatusCodes } = require("http-status-codes");
const reviewService = require("./review.service");

const createReview = async (req, res) => {
   try {
      const review = await reviewService.createReview({
         body: req.body,
         userId: req.user.userId,
      });
      res.status(StatusCodes.CREATED).json({ review });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getAllReviews = async (req, res) => {
   try {
      const result = await reviewService.getAllReviews();
      res.status(StatusCodes.OK).json(result);
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getSingleReview = async (req, res) => {
   try {
      const review = await reviewService.getSingleReview(req.params.id);
      res.status(StatusCodes.OK).json({ review });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const updateReview = async (req, res) => {
   try {
      const { rating, title, comment } = req.body;
      const review = await reviewService.updateReview({
         reviewId: req.params.id,
         rating,
         title,
         comment,
         requestUser: req.user,
      });
      res.status(StatusCodes.OK).json({ review });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const deleteReview = async (req, res) => {
   try {
      await reviewService.deleteReview({
         reviewId: req.params.id,
         requestUser: req.user,
      });
      res.status(StatusCodes.OK).json({ msg: "Success! Review removed" });
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
   }
};

const getSingleProductReviews = async (req, res) => {
   try {
      const result = await reviewService.getSingleProductReviews(req.params.id);
      res.status(StatusCodes.OK).json(result);
   } catch (error) {
      const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(statusCode).json({ error: error.message });
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
