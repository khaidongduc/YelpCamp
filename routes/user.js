const express = require('express');
const passport = require('passport');

const controller = require('../controllers/user');

const wrapAsync = require('../utils/wrapAsync');
const { ensureLoggedIn } = require('../utils/middlewares');

const router = express.Router({ mergeParams: true });

// register
router.route('/register')
    .get(controller.renderRegisterForm)
    .post(wrapAsync(controller.registerUser));

// log in
router.route('/login')
    .get(controller.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/user/login' }),
        controller.loginFlashAndRedirect);

// log out
router.get('/logout', ensureLoggedIn, controller.logOutUser);

module.exports = router;