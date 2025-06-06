const { Rating, Image } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

//^ Query to insert a new rating and update the average rating in the images table
const insertRating = async (rating) => {
    // Create new rating
    const newRating = new Rating({
        id: uuidv4(),  // Generate unique ID
        image_id: rating.image_id,
        rating_value: rating.rating_value,
        submitted_by: rating.submitted_by,
        review: rating.review || '',
        created_at: new Date()
    });
    await newRating.save();

    // Get all ratings for this image
    const ratings = await Rating.scan()
        .filter('image_id').eq(rating.image_id)
        .exec();
    const ratingValues = ratings.map(r => r.rating_value);
    
    // Calculate average rating
    const averageRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;
    
    // Update image with new average rating
    const image = await Image.get(rating.image_id);
    if (image) {
        image.rating = parseFloat(averageRating.toFixed(1));
        await image.save();
    }

    return newRating.toJSON();
};

//^ Query to get all ratings for a specific image
const getRatingsByImageId = async (imageId) => {
    // First verify the image exists and is active
    const image = await Image.get(imageId);
    if (!image || image.status === 'archived') {
        return [];
    }

    // Get ratings using the GSI
    const ratings = await Rating.scan()
        .filter('image_id').eq(imageId)
        .exec();
    return ratings.toJSON();
};

//^ Query to get the average rating for a specific image
const getAverageRatingByImageId = async (imageId) => {
    const image = await Image.get(imageId);
    if (!image || image.status === 'archived') {
        return 0;
    }
    return image.rating || 0;
};

module.exports = {
    insertRating,
    getRatingsByImageId,
    getAverageRatingByImageId
}; 