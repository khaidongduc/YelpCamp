const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });

const wrapAsync = require('../utils/wrapAsync');
const { ensureLoggedIn, verifyCampgroundAuthor, validateCampground } = require('../utils/middlewares');

const controller = require('../controllers/campground');
const express = require('express');
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(wrapAsync(controller.getIndex))
    .post(ensureLoggedIn, upload.array("campground[images]"), validateCampground,
        wrapAsync(controller.createCampground));


router.get('/new', ensureLoggedIn, controller.renderNewForm);

router.route('/:id')
    .get(wrapAsync(controller.displayCampground))
    .put(ensureLoggedIn, verifyCampgroundAuthor, upload.array("campground[images]"), 
        validateCampground, wrapAsync(controller.editCampground))
    .delete(ensureLoggedIn, verifyCampgroundAuthor, wrapAsync(controller.deleteCampground));

router.get('/:id/edit', ensureLoggedIn, verifyCampgroundAuthor,
    wrapAsync(controller.renderEditCampgroundForm));

module.exports = router;