const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = require('./review');

const campgroundSchema = new Schema({
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
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

campgroundSchema.post('findOneAndDelete', async function (farm) {
    if (farm) {
        await Review.deleteMany({
            _id: {$in: farm.reviews}
        });
    }
})

module.exports = mongoose.model('Campground', campgroundSchema);