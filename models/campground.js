const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Review = require('./review');
const imageSchema = new Schema({
    url: String,
    filename: String
});

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };
const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

campgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground) {
        await Review.deleteMany({
            _id: { $in: campground.reviews }
        });
    }
})

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    var imageUrl = "https://res.cloudinary.com/dbgsbqpht/image/upload/v1603977765/YelpCamp/3976c789-no_image_available_vmiuqt.jpg";
    if(this.images.length) imageUrl = this.images[0].url;
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>`
        + `<p>${this.description.substring(0, 100)}...</p>` + 
        `<img class="img-thumbnail w-50" src="${imageUrl}">`;
});


module.exports = mongoose.model('Campground', campgroundSchema);