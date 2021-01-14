var Course = require('../models/course');
var User = require('../models/user');
var Category = require('../models/category');

exports.list_courses = (req, res, next) => {
    const category = req.query.category || "none";
    console.log(category);
    const page = Number(req.query.page) || Number(1);
    if (category == "none") {
        Course.find({ status: 1 }).lean().exec(async function(err, course) {
            var list_courses = [],
                page_number = [],
                i = 0;
            for (let _i = 0; _i < course.length; _i++) {
                if (course[_i].status == 0) continue;
                if (Math.floor(i / 8) == page - 1) {
                    course[i].price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course[i].price);
                    const data = course[i];
                    data['page'] = i + 1;
                    await User.findOne({ _id: data.ownerId }, (err, user) => {
                        if (err) return next(err);
                        data['nameOwner'] = user['name'];
                    });
                    list_courses.push(data);
                }
                if (i / 8 == Math.floor(i / 8)) {
                    page_number.push((i / 8) + 1);
                }
                i++;
            }
            Category.find({ status: 1 }).lean().exec(function(err, category) {
                if (err) return next(err);
                for (var i = 0; i < category.length; i++) {
                    if (!category[i].categories) continue;
                    let childCategories = category[i].categories;
                    let newChildCategories = [];
                    for (var j = 0; j < childCategories.length; j++) {
                        if (childCategories[j].status === 1) {
                            newChildCategories.push(childCategories[j]);
                        }
                    }
                    category[i].categories = newChildCategories;
                }
                res.render('courses/list-courses', {
                    list_courses: list_courses,
                    category: category,
                    page_number: page_number,
                    current_page: page
                });
            });
        });
    } else {
        Course.find({ status: 1, categoryChildName: category }).lean().exec(async function(err, course) {
            var list_courses = [],
                page_number = [],
                i = 0;
            for (let _i = 0; _i < course.length; _i++) {
                if (course[_i].status == 0) continue;
                if (Math.floor(i / 8) == page - 1) {
                    course[i].price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course[i].price);
                    const data = course[i];
                    data['page'] = i + 1;
                    await User.findOne({ _id: data.ownerId }, (err, user) => {
                        if (err) return next(err);
                        data['nameOwner'] = user['name'];
                    });
                    list_courses.push(data);
                }
                if (i / 8 == Math.floor(i / 8)) {
                    page_number.push((i / 8) + 1);
                }
                i++;
            }

            Category.find({ status: 1 }).lean().exec(function(err, category) {
                if (err) return next(err);
                for (var i = 0; i < category.length; i++) {
                    if (!category[i].categories) continue;
                    let childCategories = category[i].categories;
                    let newChildCategories = [];
                    for (var j = 0; j < childCategories.length; j++) {
                        if (childCategories[j].status === 1) {
                            newChildCategories.push(childCategories[j]);
                        }
                    }
                    category[i].categories = newChildCategories;
                }
                res.render('courses/list-courses', {
                    list_courses: list_courses,
                    category: category,
                    page_number: page_number,
                    current_page: page
                });
            });
        });
    }

}
exports.course_detail = (req, res, next) => {
    let id = req.params.id;
    Course.findOne({ _id: id }).lean().exec(async function(err, course_detail) {
        await User.findOne({ _id: course_detail.ownerId }, (err, user) => {
            if (err) return next(err);
            course_detail['name_owner'] = user['name'];
            course_detail['email_owner'] = user['email'];
        });
        let num_order = [];
        let num = 0
        let point = 0.0;
        for (var i = 1; i <= course_detail.videos.length; i++) {
            num_order.push(i);
        }
        for (var i = 0; i < course_detail.subscribers.length; i++) {
            point = point + course_detail.subscribers[i].point;
            if (course_detail.subscribers[i].comment !== "") {
                num++;
            }
            await User.findOne({ _id: course_detail.subscribers[i].userId }, (err, user) => {
                if (err) return next(err);
                course_detail.subscribers[i]['name_sub'] = user['name'];
            });
        }
        course_detail.price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course_detail.price);
        point = point / course_detail.subscribers.length;
        Course.find({ categoryChildName: course_detail.categoryChildName }).lean().exec(function(err, course) {
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
            for (var i = 0; i <= 4; i++) {
                course[i].price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course[i].price);
                course_popular.push(course[i]);
            }
            Course.findOne({ _id: id }, function(err, course_view) {
                course_view.views = course_view.views + 1;
                course_view.save(function(err, result) {});
                res.render('courses/course-detail', {
                    num: num,
                    point: point,
                    num_order: num_order,
                    course: course_detail,
                    course_popular: course_popular
                });
            });
        })

    });

}