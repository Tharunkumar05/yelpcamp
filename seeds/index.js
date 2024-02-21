const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const{places, descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')


const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
})

// from {places, descriptors} the value of the array is given.

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const price = Math.floor(Math.random()*20) + 10 ;
        const random100 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            author: '65c63e210d2d3eb1a383bef5',
            location: `${cities[random100].city}, ${cities[random100].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus architecto provident recusandae laborum aspernatur accusantium ipsam voluptates rerum nemo? Illum ut laborum corporis cupiditate id nisi vitae temporibus ipsum voluptate.',
            price: price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dok1t4lco/image/upload/v1708260230/yelpcamp/k9fevs7j1emlxp5p1jcb.jpg',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                },
                {
                    url: 'https://res.cloudinary.com/dok1t4lco/image/upload/v1708260234/yelpcamp/egkv7grfd0ifrclnukge.jpg',
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                }
            ]
        })

        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })

