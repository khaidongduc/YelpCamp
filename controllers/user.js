const User = require('../models/user');

module.exports.renderRegisterForm = (req, res, next) => {
    res.render('users/register');
}

module.exports.registerUser = async (req, res, next) => {
    const { email, username, password } = req.body;
    try {
        const newUser = await User.register(new User({ email, username }), password);
        req.logIn(newUser, err => {
            if(err) return next(err);
        });
        req.flash('success', 'Welcom to Yelp Camp');
        res.redirect('/campgrounds');
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/user/register');
    }
}

module.exports.renderLoginForm = (req, res, next) => {
    res.render('users/login');
}

module.exports.loginFlashAndRedirect = (req, res, next) => {
    req.flash('success', 'Welcome Back');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logOutUser = (req, res, next) => {
    req.logOut();
    req.flash('success', 'Good Bye');
    res.redirect('/campgrounds');
}