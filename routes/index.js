var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeController');
var courseController = require('../controllers/courseController');
var userController = require('../controllers/userController');
var teacherController = require('../controllers/teacherController');
const user = require('../models/user');

/* GET home page. */
router.get('/', homeController.index);

router.get('/list-courses', courseController.list_courses);

router.get('/course-detail/:id', courseController.course_detail);

router.get('/course-video', courseController.course_video);



/* user */
router.get('/login', userController.login);

router.post('/login', userController.user_login);

router.get('/logout', userController.logout);

router.get('/register', userController.register);

router.post('/register', userController.post_register);

router.get('/profile', userController.profile);

router.post('/profile', userController.edit_profile);

router.get('/password', userController.password);

router.post('/password', userController.change_password);

router.get('/enrolled-courses', userController.enrolled_courses);

router.get('/add-wishlist/:id', userController.add_remove_wishlist);

/* teacher */
router.get('/manage-courses', teacherController.manage_courses);

router.get('/lock-course', teacherController.lock_course);

router.get('/unlock-course', teacherController.unlock_course);

module.exports = router;