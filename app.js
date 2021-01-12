var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
require('dotenv').config();
var app = express();


// set up mongoose connection
mongoose.connect(process.env.URL_DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connect error!'));
db.once('open', function(callback) {
    console.log("connection succeeded");
});

// view engine setup
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutDir: __dirname + '/views/layouts/',
    helpers: {
        predictPage: (currentPage, step) => {
            return currentPage + step;
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
                return "background-color: #01bafd; color: #fff";
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

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;