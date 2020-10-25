const express = require('express');

const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');

const campgroundValidateSchema = require('../validateSchemas/campgroundSchema')
const Campground = require('../models/campground');

const router = express.Router();

function validateCampground(req, res, next) {
    const validateResult = campgroundValidateSchema.validate(req.body);
    const { error } = validateResult;
    if (error) {
        let message = error.details.map(el => el.message).join(',');
        throw new ExpressError(400, message);
    } else next();
}


// posts' index route
router.get('/', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

// posting new post
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})
router.post('/', validateCampground, wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

// get the post
router.get('/:id', wrapAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));

// update post route
router.get('/:id/edit', wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id', validateCampground, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

// delete post
router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;