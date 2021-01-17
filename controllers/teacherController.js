const Course = require('../models/course');
const User = require('../models/user');
const Category = require('../models/category');

exports.list_courses = async (req, res, next) => {
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
        const filterByCategory = req.query.filterByCategory;
        const filterByUser = req.query.filterByUser;
        if (filterByCategory || filterByUser) {
            if (filterByCategory) {
                await Course.find({ categoryRootId: filterByCategory })
                    .lean()
                    .exec(async (err, listCourses) => {
                        if (err) {
                            return next(err);
                        }
                        var listCoursesInOnePage = [],
                            page_number = [];
                        for (let i = 0; i < listCourses.length; i++) {
                            if (Math.floor(i / 8) == page - 1) {
                                const data = listCourses[i];
                                data['page'] = i + 1;
                                await User.findOne({ _id: data.ownerId }, (err, user) => {
                                    if (err) return next(err);
                                    data['nameOwner'] = user['name'];
                                });
                                listCoursesInOnePage.push(data);
                            }
                            if (i / 8 == Math.floor(i / 8)) {
                                page_number.push((i / 8) + 1);
                            }
                        }
                        res.render('courses/list-courses', {
                            filterByCategory: filterByCategory,
                            filterByUser: filterByUser,
                            users: users,
                            categories: categories,
                            currentPage: page,
                            page_number: page_number,
                            listCoursesInOnePage: listCoursesInOnePage
                        });
                    });
            } else {
                if (filterByUser) {
                    await Course.find({ ownerId: filterByUser })
                        .lean()
                        .exec(async (err, listCourses) => {
                            if (err) {
                                return next(err);
                            }
                            var listCoursesInOnePage = [],
                                page_number = [];
                            for (let i = 0; i < listCourses.length; i++) {
                                if (Math.floor(i / 8) == page - 1) {
                                    const data = listCourses[i];
                                    data['page'] = i + 1;
                                    await User.findOne({ _id: data.ownerId }, (err, user) => {
                                        if (err) return next(err);
                                        data['nameOwner'] = user['name'];
                                    });
                                    listCoursesInOnePage.push(data);
                                }
                                if (i / 8 == Math.floor(i / 8)) {
                                    page_number.push((i / 8) + 1);
                                }
                            }
                            res.render('courses/list-courses', {
                                filterByCategory: filterByCategory,
                                filterByUser: filterByUser,
                                users: users,
                                categories: categories,
                                currentPage: page,
                                page_number: page_number,
                                listCoursesInOnePage: listCoursesInOnePage
                            });
                        });
                }
            }
        } else {
            await Course.find()
                .lean()
                .exec(async (err, listCourses) => {
                    if (err) {
                        next(err);
                    }
                    var listCoursesInOnePage = [],
                        page_number = [];
                    for (let i = 0; i < listCourses.length; i++) {
                        if (Math.floor(i / 8) == page - 1) {
                            const data = listCourses[i];
                            data['page'] = i + 1;
                            await User.findOne({ _id: data.ownerId }, (err, user) => {
                                if (err) return next(err);
                                data['nameOwner'] = user['name'];
                            });
                            listCoursesInOnePage.push(data);
                        }
                        if (i / 8 == Math.floor(i / 8)) {
                            page_number.push((i / 8) + 1);
                        }
                    }
                    res.render('courses/list-courses', {
                        filterByCategory: filterByCategory,
                        filterByUser: filterByUser,
                        users: users,
                        categories: categories,
                        currentPage: page,
                        page_number: page_number,
                        listCoursesInOnePage: listCoursesInOnePage
                    });
                });
        }
    } else {
        res.redirect('/login');
    }

}

exports.lock_course = (req, res, next) => {
    const id = req.query.id;
    Course.findOne({ _id: id }, async (err, course) => {
        if (err) return next(err);
        course.status = 0;
        await course.save((err, result) => { });
        res.redirect('/list-courses');
    });
}

exports.unlock_course = (req, res, next) => {
    const id = req.query.id;
    Course.findOne({ _id: id }, async (err, course) => {
        if (err) return next(err);
        course.status = 1;
        await course.save((err, result) => { });
        res.redirect('/list-courses');
    });
}