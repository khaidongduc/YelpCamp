if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const secret = process.env.SESSION_SECRET || "a secret";
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
const port = process.env.PORT || 3000;

const express = require('express');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

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


const mongoose = require('mongoose');
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
// set up view engine
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));

// set up authentication
const MongoDBStore = require('connect-mongo')(session);
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 // a day
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // a week
        maxAge: 1000 * 60 * 60 * 24 * 7
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

// security
app.use(mongoSanitize({
    replaceWith: '_'
})); // sanitize query string
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/douqbebwk/",
                "https://source.unsplash.com/",
                "https://images.unsplash.com/",
                "https://res.cloudinary.com/dbgsbqpht/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

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
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})