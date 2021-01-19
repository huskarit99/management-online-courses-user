var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeController');
var courseController = require('../controllers/courseController');
var userController = require('../controllers/userController');
var teacherController = require('../controllers/teacherController');

/* guest. */
router.get('/', homeController.index);

router.get('/list-courses', courseController.list_courses);

router.get('/course-detail/:id', courseController.course_detail);

router.get('/course-video', courseController.course_video);

router.get('/search-course', courseController.search_course);

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

router.get('/add-remove-wishlist/:id', userController.add_remove_wishlist);

router.get('/wishlist', userController.wishlist);

router.get('/enroll/:id', userController.enroll);

router.post('/rating/:id', userController.rating);

/* teacher */
router.get('/manage-courses', teacherController.manage_courses);

router.get('/edit-course', teacherController.edit_course);

module.exports = router;