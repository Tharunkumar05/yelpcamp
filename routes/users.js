const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(users.signUp )
    .post(catchAsync(users.successSignUp));


router.route('/login') 
    .get(users.login)
    .post(
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    // Now we can use res.locals.returnTo to redirect the user after login
    users.postLogin);

router.get('/logout', users.logout)

module.exports = router;