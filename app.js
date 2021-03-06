var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const bodyParser = require('body-parser');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var tagRouter = require('./routes/tags')
const flash = require('connect-flash');
var Handlebars = require('hbs');
var moment = require('moment');
const passport = require('passport');

var app = express();

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//passport config
require('./config/passport')(passport)
app.use(passport.initialize())
app.use(passport.session())

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

Handlebars.registerHelper('formatDate', function(dateString) {
  return new Handlebars.SafeString(
      moment(dateString).format("M/D/Y")
  );
});

Handlebars.registerHelper('formatDateTime', function(dateString) {
  return new Handlebars.SafeString(
      moment(dateString).format("lll")
  );
});

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tags', tagRouter);


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

