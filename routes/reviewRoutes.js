const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authentication");

const {
   createReview,
   getAllReviews,
   getSingleReview,
   updateReview,
   deleteReview,
   getSingleProductReviews,
} = require("../controllers/reviewController");

router.post("/createReview", authenticateUser, createReview);
router.get("/", getAllReviews);

router
   .route("/:id")
   .get(getSingleReview)
   .patch(authenticateUser, updateReview)
   .delete(authenticateUser, deleteReview)
   
   router.route('/product/:id').get(getSingleProductReviews)

module.exports = router;
