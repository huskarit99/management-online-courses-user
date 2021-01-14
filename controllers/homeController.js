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
            console.log(category)
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
            res.render('users/index', {
                courseHightlight: courseHightlight,
                newCourse: newCourse,
                viewCourse: viewCourse,
                category: category
            });
        });

    });

}