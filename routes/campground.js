const express = require('express');

const wrapAsync = require('../utils/wrapAsync');
const { ensureLoggedIn, verifyCampgroundAuthor, validateCampground } = require('../middlewares');

const controller = require('../controllers/campground');
const router = express.Router();

router.route('/')
    .get(wrapAsync(controller.getIndex))
    .post(ensureLoggedIn, validateCampground, wrapAsync(controller.createCampground));

router.get('/new', ensureLoggedIn, controller.renderNewForm);

router.route('/:id')
    .get(wrapAsync(controller.displayCampground))
    .put(ensureLoggedIn, verifyCampgroundAuthor, validateCampground, wrapAsync(controller.editCampground))
    .delete(ensureLoggedIn, verifyCampgroundAuthor, wrapAsync(controller.deleteCampground));

router.get('/:id/edit', ensureLoggedIn, verifyCampgroundAuthor,
    wrapAsync(controller.renderEditCampgroundForm));

module.exports = router;