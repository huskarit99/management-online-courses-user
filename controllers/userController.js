var User = require('../models/user');
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.login = (req, res, next) => {
    res.render('users/login');
}

passport.use(new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'username',
        passwordField: 'password'
    },
    function(req, usernameField, passwordField, done) {
        User.findOne({ username: usernameField, status: 1 }, function(err, user) {
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
    function(req, res) {
        res.redirect('/');
    }

exports.logout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
}

exports.register = (req, res, next) => {
    res.render('users/register');
}

exports.post_register = (req, res, next) => {
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    User.findOne({ username: req.body.username },
        function(err, user) {
            if (err) return next(err);
            if (user !== null) {
                res.render('users/register', { message: 'Username already exist' });
            } else {
                User.findOne({ email: email }, function(err, user_email) {
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
                        user_email.save(function(err, result) {});
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
    User.findOne({ username: username }, function(err, user) {
        if (user !== null) {
            if (user.name !== name) {
                user.name = name;
                if (user.email !== email) {
                    User.findOne({ email: email }, function(err, user_email) {
                        if (user_email !== null) {
                            res.render("users/profile", { message: 'Email already exist' });
                        } else {
                            user.email = email;
                            req.session.userSession = user;
                            user.save(function(err, result) {});
                            res.redirect('/profile');
                        }
                    });
                } else {
                    req.session.userSession = user;
                    user.save(function(err, result) {});
                    res.redirect('/profile');
                }
            } else {
                if (user.email !== email) {
                    User.findOne({ email: email }, function(err, user_email) {
                        if (user_email !== null) {
                            res.render("users/profile", { message: 'Email already exist' });
                        } else {
                            user.email = email;
                            req.session.userSession = user;
                            user.save(function(err, result) {});
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
    User.findOne({ username: req.session.userSession.username }, function(err, user) {
        if (err) { return done(err); }
        if (user !== null) {
            var hash = user.password;
            if (bcrypt.compareSync(oldpassword, hash)) {
                if (oldpassword != newpassword) {
                    if (newpassword == confirmpassword) {
                        user.password = bcrypt.hashSync(newpassword, bcrypt.genSaltSync(10));
                        user.save(function(err, result) {});
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