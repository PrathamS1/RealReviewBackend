const express = require("express");
const router = express.Router();
const { rateImage, getRatings } = require("../controllers/ratingController");

//! Route to Rate an image
router.post("/:id/rate", rateImage);

//! Route to Get ratings for an image
router.get("/:id/ratings", getRatings);

module.exports = router; 