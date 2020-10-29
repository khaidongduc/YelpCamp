const mongoose = require('mongoose');
const Campground = require('../models/campground');


const db = require('../utils/dbconnect');
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB = async () => {
    await Campground.deleteMany({});
}


seedDB().then(() => {
    mongoose.connection.close();
})