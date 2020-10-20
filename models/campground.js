const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: Number,
    description: String,
    location: {
        type: String,
        required: true
    },
    image: {
        type: String,
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);