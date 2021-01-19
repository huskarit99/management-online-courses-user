const Course = require('../models/course');
const User = require('../models/user');
const Category = require('../models/category');

exports.manage_courses = async (req, res, next) => {
    if (req.session.userSession) {
        const page = Number(req.query.page) || Number(1);
        var users = [];
        var categories = [];
        await User.find({ status: 1, role: 1 }).lean().exec((err, listUser) => {
            if (err) return next(err);
            if (listUser)
                users = listUser;
        });
        await Category.find({ status: 1 }).lean().exec((err, listCategory) => {
            if (err) return next(err);
            if (listCategory) {
                categories = listCategory;
            }
        });
        await Course.find()
            .lean()
            .exec(async (err, listCourses) => {
                if (err) {
                    next(err);
                }
                var listCoursesInOnePage = [],
                    page_number = [];
                for (let i = 0; i < listCourses.length; i++) {
                    if (Math.floor(i / 6) == page - 1) {
                        const data = listCourses[i];
                        data['page'] = i + 1;
                        data['price'] = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data['price']);
                        var point = 0;
                        var num = 0;
                        if (data.subscribers.length != 0) {
                            for (var j = 0; j < data.subscribers.length; j++) {
                                if (data.subscribers[j].point > 0) {
                                    point = point + data.subscribers[j].point;
                                    num++;
                                }
                            }
                            if (num > 0) {
                                point = point / num;
                            }
                            data['point'] = point;
                            data['num'] = num;
                        }
                        await User.findOne({ _id: data.ownerId }, (err, user) => {
                            if (err) return next(err);
                            data['nameOwner'] = user['name'];
                        });
                        listCoursesInOnePage.push(data);
                    }
                    if (i / 6 == Math.floor(i / 6)) {
                        page_number.push((i / 6) + 1);
                    }
                }
                res.render('teachers/manage-courses', {
                    users: users,
                    categories: categories,
                    currentPage: page,
                    page_number: page_number,
                    listCoursesInOnePage: listCoursesInOnePage
                });
            });
    } else {
        res.redirect('/login');
    }
}

exports.edit_course = (req, res, next) => {
    let id = req.params.id;

    Course.findOne({ _id: id }).lean().exec(async function (err, course_detail) {
        let data = course_detail;
        await User.findOne({ _id: course_detail.ownerId }, (err, user) => {
            if (err) return next(err);
            data['name_owner'] = user['name'];
            data['email_owner'] = user['email'];
        });
        course_detail = data;
        for (var i = 0; i < course_detail.subscribers.length; i++) {
            let tmp = course_detail.subscribers[i];
            await User.findOne({ _id: course_detail.subscribers[i].userId }, (err, user) => {
                if (err) return next(err);
                tmp['name_sub'] = user['name'];
            });
            course_detail.subscribers[i] = tmp;
        }
        let num_order = [];
        let num = 0
        let point = 0;
        let check = 0
        let check_rating = 0;
        for (var i = 1; i <= course_detail.videos.length; i++) {
            num_order.push(i);
        }
        if (course_detail.subscribers.length != 0) {
            for (var i = 0; i < course_detail.subscribers.length; i++) {
                if (req.session.userSession && check == 0) {

                    if (req.session.userSession._id == course_detail.subscribers[i].userId) {
                        check = 1;
                        if (course_detail.subscribers[i].point < 1) {
                            check_rating = 1;
                        }
                    } else {
                        check = 0;
                    }
                }
                if (course_detail.subscribers[i].point > 0) {
                    point = point + course_detail.subscribers[i].point;
                    num++;
                }
            }
            if (num > 0) {
                point = point / num;
            }
        }
        console.log(check_rating);
        course_detail.price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course_detail.price);

        Course.find({ categoryChildName: course_detail.categoryChildName }).lean().exec(function (err, course) {
            for (var i = 0; i < course.length - 1; i++) {
                for (var j = i + 1; j < course.length; j++) {
                    if (course[i].subscribers.length < course[j].subscribers.length) {
                        const tmp = course[i];
                        course[i] = course[j];
                        course[j] = tmp;
                    }
                }
            }
            let course_popular = [];
            if (course.length <= 5) {
                for (var i = 0; i < course.length; i++) {
                    course[i].price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course[i].price);
                    course_popular.push(course[i]);
                }
            } else {
                for (var i = 0; i <= 4; i++) {
                    course[i].price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course[i].price);
                    course_popular.push(course[i]);
                }
            }
            let check_heart = -1
            if (req.session.userSession) {
                let itemIndex = req.session.userSession.wishlist.findIndex(p => p.courseId == id);
                if (itemIndex > -1) {
                    check_heart = 1;
                } else {
                    check_heart = 0;
                }

            }
            console.log(check_heart);

            Course.findOne({ _id: id }, function (err, course_view) {
                course_view.views = course_view.views + 1;
                course_view.save(function (err, result) { });
                res.render('courses/course-detail', {
                    num: num,
                    point: point,
                    num_order: num_order,
                    course: course_detail,
                    course_popular: course_popular,
                    check: check,
                    check_heart: check_heart,
                    check_rating: check_rating
                });
            });
        })

    });

}