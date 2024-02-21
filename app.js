if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

 
const url = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
// 

mongoose.connect(url)
const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
}) 

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: url,
    touchAfter: 24*60*60,
    crypto: {
        secret,
    }
});

store.on("error", function(e){
    console.log("Session store error", e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(mongoSanitize());


app.use(session(sessionConfig));

// It will automatically pass into the template, we dont have to pass into  individual template
//so use middleware to pass it automatically
//  Use flash middleware after session and cookies middleware used otherwise it will show error in ejs template as not defined

app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
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
                "https://res.cloudinary.com/dok1t4lco/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            // fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())) ;

// SerializeUser stores user information on a session
// deserializeUser deleted user information from a session

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {

    // console.log(req.user);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})




app.use("/", userRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/reviews",reviewRoutes);


// this express.static will be very useful for serving static file like javascript and stylesheeet for validation and styles respectively.
// Here from public folder it will serve the ejs file .

// the $pull operator removes from an existing array all instances of a value or values that match a specified condition.
// so here, this helpful to remove reviews from campgroundSchema without deleting camground data.
app.get("/", (req,res) => {
    res.render('home')
})


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})


app.use((err,req,res,next)=>{
    const {statuscode = 500} = err;
    if(!err.message)err.message='Something Went Wrong'
    res.status(statuscode).render('error',{err});
})



app.listen(3000, ()=>{
    console.log("Server running on port 3000");
})


