const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});

router.route('/:id/edit').get(isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground))

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post( isLoggedIn, upload.array('image'), catchAsync(campgrounds.createCampground))
    // .post(upload.array('image'),(req,res)=>{
    //     console.log(req.body, req.files);
    //     res.send("IT WORKED!")
    // })

router.route('/new')
    .get(isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get( catchAsync(campgrounds.showPage))
    .put( isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete( isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;