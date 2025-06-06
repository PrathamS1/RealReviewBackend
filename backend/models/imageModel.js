const dynamoose = require('dynamoose');

const imageSchema = new dynamoose.Schema({
    id: {
        type: String,
        hashKey: true,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    submitted_by: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: () => new Date()
    },
    rating: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    }
}, {
    timestamps: true
});
console.log("Image Schema:", imageSchema.hashKey);
const Image = dynamoose.model('Images', imageSchema);

module.exports = Image;