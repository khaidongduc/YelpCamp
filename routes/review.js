const express = require('express');

const { ensureLoggedIn, validateReview, verifyReviewAuthor } = require('../middlewares');
const wrapAsync = require('../utils/wrapAsync');

const controller = require('../controllers/review');
const router = express.Router({ mergeParams: true });

// add new reviews
router.post('/', ensureLoggedIn, validateReview, wrapAsync(controller.createReview));

// deleting reviews
router.delete('/:reviewId', ensureLoggedIn, verifyReviewAuthor, wrapAsync(controller.deleteReview))

module.exports = router;