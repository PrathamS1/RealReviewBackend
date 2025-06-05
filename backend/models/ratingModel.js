const dynamoose = require('dynamoose');

const ratingSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    image_id: {
        type: String,
        required: true,
        index: {
            name: 'imageIdIndex',
            global: true
        }
    },
    rating_value: {
        type: Number,
        required: true,
        validate: (value) => value >= 1 && value <= 5
    },
    created_at: {
        type: Date,
        default: () => new Date()
    },
    submitted_by: {
        type: String,
        required: true
    },
    review: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Rating = dynamoose.model('Ratings', ratingSchema);

module.exports = Rating; 