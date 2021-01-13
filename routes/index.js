var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeController');
var courseController = require('../controllers/courseController');
var userController = require('../controllers/userController');

/* GET home page. */
router.get('/', homeController.index);

router.get('/list-courses', courseController.list_courses);

router.get('/course-detail/:id', courseController.course_detail);

router.get('/course-video', function(req, res, next) {
    res.render('courses/course-video', { title: 'Express' });
});

/* user */
router.get('/login', userController.login);

router.post('/login', userController.user_login);

router.get('/logout', userController.logout);

router.get('/register', userController.register);

router.post('/register', userController.post_register);

router.get('/profile', userController.profile);

router.post('/profile', userController.edit_profile);

module.exports = router;