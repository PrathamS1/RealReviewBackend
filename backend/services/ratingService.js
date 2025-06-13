const {
    insertRating,
    getRatingsByImageId,
    getAverageRatingByImageId
} = require("../repository/ratingRepo");
const Rating = require("../models/ratingModel");
const { getImageById } = require("./imageService");
const { AppError, handleDatabaseError, handleRatingError, RATING_ERRORS } = require("../errors/errorHandler");

//* Service function to add a rating to an image
const addRating = async (imageId, ratingValue, submitted_by, review = '') => {
    try {
        const image = await getImageById(imageId);
        if (!image) {
            throw new AppError(RATING_ERRORS.NOT_FOUND);
        }
        if (ratingValue < 1 || ratingValue > 5) {
            throw new AppError(RATING_ERRORS.INVALID_RATING);
        }

        const rating = new Rating({
            image_id: imageId,
            rating_value: ratingValue,
            submitted_by: submitted_by,
            review: review,
            created_at: new Date().toISOString()
        });
        const result = await insertRating(rating);
        
        if (!result) {
            throw new AppError(RATING_ERRORS.ADD_FAILED);
        }

        const averageRating = await getAverageRatingByImageId(imageId);
        const ratingResponse = new Rating({
            image_id: result.image_id,
            rating_value: result.rating_value,
            submitted_by: result.submitted_by,
            review: result.review
        });
        ratingResponse.id = result.id;
        ratingResponse.created_at = result.created_at;

        return {
            rating: ratingResponse,
            averageRating
        };
    } catch (error) {
        console.error("Error in addRating service:", error);
        if (error instanceof AppError) {
            throw error;
        }
        // database errors
        if (error.code) {
            throw handleDatabaseError(error);
        }
        // other errors
        throw handleRatingError(error);
    }
};

//* Service function to get ratings for an image
const getImageRatings = async (imageId) => {
    try {
        const image = await getImageById(imageId);
        if (!image) {
            throw new AppError(RATING_ERRORS.NOT_FOUND);
        }

        const ratings = await getRatingsByImageId(imageId);
        const averageRating = await getAverageRatingByImageId(imageId);
        
        const transformedRatings = ratings.map(rating => {
            const ratingObj = new Rating({
                image_id: rating.image_id,
                rating_value: rating.rating_value,
                submitted_by: rating.submitted_by,
                review: rating.review
            });
            ratingObj.id = rating.id;
            ratingObj.created_at = rating.created_at;
            return ratingObj;
        });

        return {
            ratings: transformedRatings,
            averageRating
        };
    } catch (error) {
        console.error("Error in getImageRatings service:", error);
        if (error instanceof AppError) {
            throw error;
        }
        // database errors
        if (error.code) {
            throw handleDatabaseError(error);
        }
        // other errors
        throw handleRatingError(error);
    }
};

module.exports = {
    addRating,
    getImageRatings
}; 