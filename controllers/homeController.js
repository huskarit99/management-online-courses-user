const course = require('../models/course');
var Course = require('../models/course');
var Category = require('../models/category');
var User = require('../models/user');

exports.index = (req, res, next) => {
    Course.find({ status: 1 }).lean().exec(async function(err, course) {
        for (var i = 0; i < course.length; i++) {
            course[i].price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course[i].price);
            var data = course[i];
            await User.findOne({ _id: data.ownerId }, (err, user) => {
                if (err) return next(err);
                data['nameOwner'] = user['name'];
            });
            var point = 0;
            var num = 0;
            if (course[i].subscribers.length != 0) {
                for (var j = 0; j < course[i].subscribers.length; j++) {
                    if (course[i].subscribers[j].point > 0) {
                        point = point + course[i].subscribers[j].point;
                        num++;
                    }
                }
                if (num > 0) {
                    point = point / num;
                }
                data['point'] = point;
                data['num'] = num;

            }
            course[i] = data;

        }
        let courseHightlight = [];
        let newCourse = [];
        let viewCourse = [];

        for (var i = 0; i < course.length - 1; i++) {
            for (var j = i + 1; j < course.length; j++) {
                if (course[i].subscribers.length < course[j].subscribers.length) {
                    const tmp = course[i];
                    course[i] = course[j];
                    course[j] = tmp;
                }
            }
        }
        let courseHightlightTemp = course;
        for (var i = 0; i <= 2; i++) {
            courseHightlight.push(course[i]);
        }


        for (var i = 0; i < course.length - 1; i++) {
            for (var j = i + 1; j < course.length; j++) {
                if (course[i].createdAt < course[j].createdAt) {
                    const tmp = course[i];
                    course[i] = course[j];
                    course[j] = tmp;
                }
            }
        }
        for (var i = 0; i <= 9; i++) {
            newCourse.push(course[i]);
        }

        for (var i = 0; i < course.length - 1; i++) {
            for (var j = i + 1; j < course.length; j++) {
                if (course[i].views < course[j].views) {
                    const tmp = course[i];
                    course[i] = course[j];
                    course[j] = tmp;
                }
            }
        }
        for (var i = 0; i <= 9; i++) {
            viewCourse.push(course[i]);
        }

        Category.find({ status: 1 }).lean().exec(function(err, category) {
            if (err) return next(err);
            req.session.category = category;
            for (var i = 0; i < category.length; i++) {
                // if (!category[i].categories) continue;
                // let childCategories = category[i].categories;
                // let newChildCategories = [];
                // for (var j = 0; j < childCategories.length; j++) {
                //     if (childCategories[j].status === 1) {
                //         newChildCategories.push(childCategories[j]);
                //     }
                // }
                // category[i].categories = newChildCategories;
                let data = category[i];
                let num = 0
                for (var j = 0; j < courseHightlightTemp.length; j++) {
                    if (courseHightlightTemp[j].categoryRootId == category[i]._id) {
                        num = num + courseHightlightTemp.subscribers.length;
                    }
                }
                data['num'] = num;
                category[i] = data;
            }
            for (var i = 0; i < category.length - 1; i++) {
                for (var j = i + 1; j < category.length; j++) {
                    if (category[i].num < category[j].num) {
                        const tmp = category[i];
                        category[i] = category[j];
                        category[j] = tmp;
                    }
                }
            }
            let viewCategory = [];
            for (var i = 0; i <= 4; i++) {
                viewCategory.push(category[i]);
            }
            res.render('users/index', {
                courseHightlight: courseHightlight,
                newCourse: newCourse,
                viewCourse: viewCourse,
                viewCategory: viewCategory
            });
        });

    });

}