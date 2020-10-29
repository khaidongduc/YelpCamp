const Campground = require('../models/campground');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require("../cloudinary");

module.exports.getIndex = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res, next) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', `Successfully add campground ${campground.title}`);
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.displayCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    else res.render('campgrounds/show', { campground });
}

module.exports.renderEditCampgroundForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
    }
    else {
        req.flash('success', `Successfully edited campground ${campground.title}`);
        res.render('campgrounds/edit', { campground });
    }
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    if (req.body.deleteImages) {
        let awaitList = [];
        for (filename of req.body.deleteImages) {
            awaitList.push(cloudinary.uploader.destroy(filename));
        }
        awaitList.push(campground.updateOne({ $pull: { 
            images: { filename: { $in: req.body.deleteImages } } } 
        }));
        await Promise.all(awaitList);    
    }
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    if (!campground) req.flash('error', 'Cannot find that campground');
    else req.flash('success', `Successfully deleted campground ${campground.title}`);
    res.redirect('/campgrounds');
}