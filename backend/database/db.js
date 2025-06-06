const dynamoose = require('dynamoose');
const Image = require('../models/imageModel');
const Rating = require('../models/ratingModel');


dynamoose.model.defaults = {
    create: true,         
    waitForActive: true,
    waitForActiveTimeout: 300000 // 5 min timeout
};

module.exports = {
    dynamoose,
    Image,
    Rating
};
(async () => {
    try {
        console.log("Attempting to ensure Image and Rating tables exist and are active...");
        await Image.scan().limit(1).exec();
        console.log("Image table checked/created successfully.");
        await Rating.scan().limit(1).exec();
        console.log("Rating table checked/created successfully.");

    } catch (error) {
        console.error("Error ensuring DynamoDB tables:", error.message);
        console.error("Full error object:", error);
    }
})();