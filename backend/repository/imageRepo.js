const { Image, Rating, dynamoose } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

//* This function inserts image data into the database
const insertImageData = async (image) => {
    const newImage = new Image({
        id: uuidv4(),
        filename: image.filename,
        location: image.location,
        submitted_by: image.submitted_by,
        rating: image.rating || null,
        timestamp: image.timestamp,
        status: 'active'
    });
    return await newImage.save();
};

//* This function retrieves all active image data from the database
const getAllImageData = async () => {
    const images = await Image.scan()
        .filter('status').eq('active')
        .exec();
    return images.toJSON();
};

//* This function retrieves image data by ID from the database
const getImagesById = async (id) => {
    const image = await Image.get(id);
    if (!image) return null;
    
    // Only return if image is active
    if (image.status === 'archived') {
        return null;
    }
    return image.toJSON();
};

//* This function deletes image data by ID from the database
const deleteImageData = async (id) => {
    const image = await Image.get(id);
    if (!image) return null;
    
    // Get all ratings for this image
    const ratings = await Rating.scan()
        .filter('image_id').eq(id)
        .exec();
    
    // Create transaction items
    const transactionItems = [
        {
            Delete: {
                TableName: Image.Model.name,
                Key: {
                    id: { S: id }
                }
            }
        }
    ];

    // Add rating deletions to transaction
    for (const rating of ratings) {
        transactionItems.push({
            Delete: {
                TableName: Rating.Model.name,
                Key: {
                    id: { S: rating.id }
                }
            }
        });
    }

    // Execute transaction
    await dynamoose.transaction(transactionItems);
    return image.toJSON();
};

module.exports = {
    insertImageData,
    getAllImageData,
    getImagesById,
    deleteImageData
};