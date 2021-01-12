var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeController');
var courseController = require('../controllers/courseController');

/* GET home page. */
router.get('/', homeController.index);

router.get('/list-courses', courseController.list_courses);

router.get('/course-detail/:id', courseController.course_detail);

router.get('/course-video', function(req, res, next) {
    res.render('courses/course-video', { title: 'Express' });
});


router.get('/login', function(req, res, next) {
    res.render('users/login', { title: 'Express' });
});

router.get('/register', function(req, res, next) {
    res.render('users/register', { title: 'Express' });
});
module.exports = router;