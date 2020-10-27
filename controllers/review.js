const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    req.body.review.author = req.user;
    const newReview = new Review(req.body.review);
    campground.reviews.push(newReview);
    await Promise.all([newReview.save(), campground.save()]); // await all at once
    req.flash('success', `Successfully created a new review`);
    res.redirect(`/campgrounds/${req.params.id}`);
}

module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    let campground = Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    let review = Review.findByIdAndDelete(reviewId);
    // await all parallelly
    await Promise.all([await campground, await review]);
    req.flash('success', `Successfully deleted a review`);
    res.redirect(`/campgrounds/${req.params.id}`);
}