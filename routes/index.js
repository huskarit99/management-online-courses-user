var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('users/index', { title: 'Express' });
});

router.get('/list-courses', function(req, res, next) {
    res.render('courses/list-courses', { title: 'Express' });
});

router.get('/course-detail', function(req, res, next) {
    res.render('courses/course-detail', { title: 'Express' });
});

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