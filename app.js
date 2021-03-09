require('dotenv').config()
var express = require('express');
var createError = require('http-errors');
var path = require('path');
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var port=8080;

var app = express();
var user= require('./routes/user.router')
var indexRouter = require('./routes/index');
var url='mongodb+srv://LocDb:123@cluster0.sqawu.mongodb.net/books?retryWrites=true&w=majority';
// Connect database

 mongoose.connect(url,{
   useNewUrlParser: true}).then(()=>{
    console.log("connection success!");
}).catch(err=>{
    console.log("connection fail !");
});
//mongoose.set('debug', true)
require('./config/passport')
// view engine setup
app.set('view engine', 'pug');
app.set('views', 'views');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'adsa897adsa98bs',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}))
app.use(flash());
app.use(passport.initialize())
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  res.locals.login=req.isAuthenticated();
   res.locals.session=req.session;
   next();
})
app.use('/', indexRouter);
app.use('/',user)

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
app.listen(port,function(){
  console.log('server listening on port' + port);
})