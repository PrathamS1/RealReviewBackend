const dynamoose = require('dynamoose');
require('dotenv').config();

// Configure Dynamoose with IAM role
dynamoose.aws.sdk.config.update({
    region: process.env.AWS_REGION || 'us-east-1'
});

// Configure Dynamoose defaults
dynamoose.model.defaults.set({
    create: true, // Create table if it doesn't exist
    waitForActive: true,
    waitForActiveTimeout: 300000 // 5 min timeout
});

// Import entity models
const Image = require('../models/imageModel');
const Rating = require('../models/ratingModel');

// Log DynamoDB connection status
dynamoose.aws.sdk.config.getCredentials((err) => {
    if (err) {
        console.error('Error connecting to DynamoDB:', err);
    } else {
        console.log('Successfully connected to DynamoDB');
    }
});

// Add table creation logging
Image.events.on('table:created', (table) => {
    console.log(`Images table created successfully: ${table.name}`);
});

Image.events.on('table:error', (err) => {
    console.error('Error creating Images table:', err);
});

Rating.events.on('table:created', (table) => {
    console.log(`Ratings table created successfully: ${table.name}`);
});

Rating.events.on('table:error', (err) => {
    console.error('Error creating Ratings table:', err);
});

module.exports = {
    dynamoose,
    Image,
    Rating
};