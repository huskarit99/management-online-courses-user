var User = require('../models/user');
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Course = require('../models/course');

exports.login = (req, res, next) => {
    if (req.session.userSession) {
        res.redirect('/')
    } else {
        res.render('users/login');
    }
}

passport.use(new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'username',
    passwordField: 'password'
},
    function (req, usernameField, passwordField, done) {
        User.findOne({ username: usernameField, status: 1 }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!bcrypt.compareSync(passwordField, user.password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            if (user.role == 0) {
                return done(null, false, { message: 'Admin can not login' });
            }
            req.session.userSession = user;

            return done(null, user);
        });
    }));

passport.serializeUser((user, done) => done(null, user));

exports.user_login = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}),
    function (req, res) {
        res.redirect('/');
    }

exports.logout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
}

exports.register = (req, res, next) => {
    if (req.session.userSession) {
        res.redirect('/');
    } else {
        res.render('users/register');
    }
}

exports.post_register = (req, res, next) => {
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    User.findOne({ username: req.body.username },
        function (err, user) {
            if (err) return next(err);
            if (user !== null) {
                res.render('users/register', { message: 'Username already exist' });
            } else {
                User.findOne({ email: email }, function (err, user_email) {
                    if (err) { return next(err) }
                    if (user_email !== null) {
                        res.render('users/register', { message: 'Email already exist' });
                    } else {
                        var salt = bcrypt.genSaltSync(10);
                        user_email = new User({
                            name: name,
                            email: email,
                            username: username,
                            password: bcrypt.hashSync(password, salt),
                            role: 2,
                            status: 1
                        });
                        user_email.save(function (err, result) { });
                        res.redirect('/login');
                    }
                });
            }
        });
}
exports.profile = (req, res, next) => {
    res.render('users/profile');
}

exports.edit_profile = (req, res, next) => {
    let email = req.body.email;
    let name = req.body.name;
    let username = req.session.userSession.username;
    User.findOne({ username: username }, function (err, user) {
        if (user !== null) {
            if (user.name !== name) {
                user.name = name;
                if (user.email !== email) {
                    User.findOne({ email: email }, function (err, user_email) {
                        if (user_email !== null) {
                            res.render("users/profile", { message: 'Email already exist' });
                        } else {
                            user.email = email;
                            req.session.userSession = user;
                            user.save(function (err, result) { });
                            res.redirect('/profile');
                        }
                    });
                } else {
                    req.session.userSession = user;
                    user.save(function (err, result) { });
                    res.redirect('/profile');
                }
            } else {
                if (user.email !== email) {
                    User.findOne({ email: email }, function (err, user_email) {
                        if (user_email !== null) {
                            res.render("users/profile", { message: 'Email already exist' });
                        } else {
                            user.email = email;
                            req.session.userSession = user;
                            user.save(function (err, result) { });
                            res.redirect('/profile');
                        }
                    });
                } else {
                    res.redirect('/profile');
                }
            }
        } else {
            res.render("users/profile", { message: 'User can not found' });
        }
    });
}
exports.password = (req, res, next) => {
    res.render('users/password');
}

exports.change_password = (req, res, next) => {
    let oldpassword = req.body.oldpassword;
    let newpassword = req.body.newpassword;
    let confirmpassword = req.body.confirmpassword;
    User.findOne({ username: req.session.userSession.username }, function (err, user) {
        if (err) { return done(err); }
        if (user !== null) {
            var hash = user.password;
            if (bcrypt.compareSync(oldpassword, hash)) {
                if (oldpassword != newpassword) {
                    if (newpassword == confirmpassword) {
                        user.password = bcrypt.hashSync(newpassword, bcrypt.genSaltSync(10));
                        user.save(function (err, result) { });
                        res.redirect('/profile');
                    } else {
                        res.render("users/password", { message: 'Wrond new password' });
                    }
                } else {
                    res.render("users/password", { message: 'Password not change' });
                }

            } else {
                res.render("users/password", { message: 'Wrond old password' });
            }
        } else {
            res.render("users/password", { message: 'User can not found' });
        }
    });
}
exports.enrolled_courses = (req, res, next) => {
    if (req.session.userSession) {
        const page = Number(req.query.page) || Number(1);
        Course.find({ status: 1 }).lean().exec(async function (err, course) {
            var list_courses = [],
                page_number = [],
                i = 0;
            var list_tmp = [];
            for (let _i = 0; _i < course.length; _i++) {
                if (course[_i].status == 0) continue;

                let itemIndex = course[_i].subscribers.findIndex(p => p.userId == req.session.userSession._id);
                if (itemIndex > -1) {
                    list_tmp.push(course[_i]);
                }
            }
            course = list_tmp;
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
            res.render('users/enrolled-courses', {
                list_courses: list_courses,
                page_number: page_number,
                current_page: page
            });
        });


    } else {
        res.redirect('/login');
    }
}
exports.add_remove_wishlist = (req, res, next) => {
    if (req.session.userSession) {
        let id = req.params.id;
        Course.findOne({ _id: id }, function (err, course) {
            if (err) return next(err);
            User.findOne({ _id: req.session.userSession._id }, function (err, user) {
                if (err) return next(err);
                let itemIndex = user.wishlist.findIndex(p => p.courseId == id);
                if (itemIndex > -1) {
                    user.wishlist.splice(itemIndex, 1);
                    req.session.userSession = user;
                    user.save();
                    res.redirect('back');
                } else {
                    var courseId = id;
                    user.wishlist.push({ courseId });
                    req.session.userSession = user;
                    user.save();
                    res.redirect('back');
                }
            })
        })
    } else {
        res.redirect('/login');
    }
}

exports.wishlist = (req, res, next) => {
    if (req.session.userSession) {
<<<<<<< HEAD
        User.findOne({ _id: req.session.userSession._id }).lean().exec(async function (err, user) {
            for (var i = 0; i < user.wishlist.length; i++) {
                var data = user.wishlist[i];
                await new Promise((rs1, rj1) => {
                    Course.findOne({ _id: data.courseId }, async function (err, course) {
                        if (err) return next(err);
                        data['image'] = course.image;
                        data['categoryChildName'] = course.categoryChildName;
                        data['name'] = course.name;
                        data['price'] = course.price;
                        data['price'] = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data['price']);
                        data['description'] = course.description;
                        await new Promise((rs2, rj2) => {
                            User.findOne({ _id: course.ownerId }, (err, user) => {
                                data['nameOwner'] = user['name'];
                                rs2("done");
=======
        User.findOne({ _id: req.session.userSession._id }).lean().exec(async function(err, user) {
            if (user.wishlist) {
                for (var i = 0; i < user.wishlist.length; i++) {
                    var data = user.wishlist[i];
                    await new Promise((rs1, rj1) => {
                        Course.findOne({ _id: data.courseId }, async function(err, course) {
                            if (err) return next(err);
                            data['image'] = course.image;
                            data['categoryChildName'] = course.categoryChildName;
                            data['name'] = course.name;
                            data['price'] = course.price;
                            data['price'] = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data['price']);
                            data['description'] = course.description;
                            await new Promise((rs2, rj2) => {
                                User.findOne({ _id: course.ownerId }, (err, user) => {
                                    data['nameOwner'] = user['name'];
                                    rs2("done");
                                });
>>>>>>> NTHoc
                            });
                            rs1("done");
                        });
                    });
                    user.wishlist[i] = data;
                    console.log(data);
                }
            }
            res.render('users/wishlist', { user: user });
        });
    } else {
        res.redirect('/login');
    }
}
exports.enroll = (req, res, next) => {
    if (req.session.userSession) {
        let id = req.params.id;
        Course.findOne({ _id: id }, function (err, course) {
            console.log(course);
            let userId = req.session.userSession._id;
            console.log(userId);
            let point = 0;
            course.subscribers.push({ userId, point });
            course.save();
            res.redirect('back');
        })
    } else {
        res.redirect('/login');
    }
}
exports.rating = (req, res, next) => {
    if (req.session.userSession) {
        let point = req.body.rating;
        let comment = req.body.comment;
        let id = req.params.id;
        Course.findOne({ _id: id }, function (err, course) {
            let itemIndex = course.subscribers.findIndex(p => p.userId == req.session.userSession._id);
            course.subscribers[itemIndex].point = point;
            course.subscribers[itemIndex].comment = comment;
            course.save();
            res.redirect('back');
        })
    } else {
        res.redirect('/login');
    }
}