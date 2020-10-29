if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require("../cloudinary");

const db = require('../utils/dbconnect');
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        let location = `${cities[random1000].city}, ${cities[random1000].state}`;
        const geoData = await geocoder.forwardGeocode({
            query: location,
            limit: 1
        }).send();
        const camp = new Campground({
            location: location,
            geometry: geoData.body.features[0].geometry,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{url:'https://source.unsplash.com/collection/483251'}],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad id dolorum quasi similique harum tenetur, dicta reprehenderit sit sapiente vitae, accusantium distinctio! Adipisci voluptatum quod accusamus officia dolorem exercitationem aliquam.',
            price: 10 + Math.floor(Math.random() * 20),
            author: "5f97aed8e4a5a07f00eca4ac"
        })
        await camp.save();
    }
}


seedDB().then(() => {
    mongoose.connection.close();
})