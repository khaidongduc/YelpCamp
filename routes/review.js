const express = require('express');
const methodOverride = require('method-override');

const router = express.Router({ mergeParams: true });


const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');


let reviewValidateSchema = require('../validateSchemas/reviewSchema');
const Campground = require('../models/campground');
const Review = require('../models/review');

function validateReview(req, res, next) {
    const validatedResult = reviewValidateSchema.validate(req.body);
    const { error } = validatedResult;
    if (error) {
        let message = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, message);
    } else next();
}

// add new reviews
router.post('/', validateReview, wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    campground.reviews.push(newReview);
    await Promise.all([newReview.save(), campground.save()]); // await all at once
    res.redirect(`/campgrounds/${req.params.id}`);
}))

// deleting reviews
router.delete('/:reviewId', wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    let campground = Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    let review = Review.findByIdAndDelete(reviewId);
    // await all parallelly
    await Promise.all([await campground, await review]);
    res.redirect(`/campgrounds/${req.params.id}`);
}))

module.exports = router;