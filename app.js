var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var passport = require('passport');
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
require('dotenv').config();
var app = express();


// set up mongoose connection
mongoose.connect(process.env.URL_DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connect error!'));
db.once('open', function (callback) {
    console.log("connection succeeded");
});

// view engine setup
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutDir: __dirname + '/views/layouts/',
    helpers: {
        predictPage: (currentPage, step) => {
            return "page=" + (currentPage + step).toString();
        },
        choosePage: (page) => {
            return "page=" + (page).toString();
        },
        isDisplayedNext: (currentPage, maxPage) => {
            if (currentPage === maxPage)
                return "display: none";
        },
        isDisplayedPrevious: (currentPage, minPage) => {
            if (currentPage === minPage)
                return "display: none";
        },
        isCurrentPage: (currentPage, page) => {
            if (currentPage === page)
                return "background-color: #337ab7; color: #fff";
        },
        eq: function () {
            const args = Array.prototype.slice.call(arguments, 0, -1);
            return args.every(function (expression) {
                return args[0] === expression;
            });
        },
        isTeacher: (role) => {
            if (role == 1) {
                return true;
            }
            return false;
        }
    }
}))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport initialize
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

// flash
app.use(flash());

// session
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'somesecret',
    cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;