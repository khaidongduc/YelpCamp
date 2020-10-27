const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');



const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
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