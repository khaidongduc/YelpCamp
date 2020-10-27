const reviewValidateSchema = require('../validateSchemas/reviewSchema');
const campgroundValidateSchema = require('../validateSchemas/campgroundSchema')

const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('./ExpressError');

function validateCampground(req, res, next) {
    const validateResult = campgroundValidateSchema.validate(req.body);
    const { error } = validateResult;
    if (error) {
        let message = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, message);
    } else next();
}

function validateReview(req, res, next) {
    req.body.review.rating = Number(req.body.review.rating);
    const validatedResult = reviewValidateSchema.validate(req.body);
    const { error } = validatedResult;
    if (error) {
        let message = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, message);
    } else next();
}

const ensureLoggedIn = function (req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', "You must be signed in");
        res.redirect('/user/login');
        return;
    }
    next();
}

const verifyCampgroundAuthor = async function(req, res, next){
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash("error", "You don't have the permission to do that!");
        res.redirect(`/campgrounds/${id}`);
        return;
    }
    next();
}

const verifyReviewAuthor = async function(req, res, next){
    const {reviewId:id} = req.params;
    const review = await Review.findById(id);;
    if(!review.author.equals(req.user._id)){
        req.flash("error", "You don't have the permission to do that!");
        res.redirect(`/campgrounds/${id}`);
        return;
    }
    next();
}

module.exports.ensureLoggedIn = ensureLoggedIn;

// verify author
module.exports.verifyCampgroundAuthor = verifyCampgroundAuthor;
module.exports.verifyReviewAuthor = verifyReviewAuthor;

// validate data
module.exports.validateCampground = validateCampground;
module.exports.validateReview = validateReview;