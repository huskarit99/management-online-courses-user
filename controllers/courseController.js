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
    Course.findById(id).lean().exec((err, course) => {
        console.log(course);
        res.render('courses/course-detail', { course: course });
    })

}