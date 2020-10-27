if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');

const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const LocalPassport = require('passport-local');

const User = require('./models/user');
const ExpressError = require('./utils/ExpressError');

const userRoute = require('./routes/user');
const campgroundRoute = require('./routes/campground');
const reviewRoute = require('./routes/review');

const db = require('./utils/dbconnect');
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
// set up view engine
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));

// set up authtenthication
const aWeek = 1000 * 60 * 60 * 24 * 7;
const sessionConfig = {
    secret: "This is a secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + aWeek,
        maxAge: aWeek,
    }
}
app.use(session(sessionConfig));
app.use(passport.initialize())
app.use(passport.session());
passport.use(new LocalPassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// others
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());


// send flash and user info to template
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// routes
app.use('/user', userRoute);
app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/reviews', reviewRoute);

// home page
app.get('/', (req, res) => {
    res.render('home')
});

// Error handling
app.all("*", (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'))
})
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    if (!err.message) err.message = "Something Went Wrong";

    res.status(statusCode).render("error", { err });
})

// start serving
app.listen(3000, () => {
    console.log('Serving on port 3000')
})