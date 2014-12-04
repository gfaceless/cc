var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session')

var util = require('util')
var fs = require('fs');
var _ = require('lodash');
var mongoose = require('mongoose');
require('./lib/mongoose-error-msg.js');

mongoose.connect('mongodb://localhost/test');



var models_path = __dirname + '/app/models';
/*fs.readdirSync(models_path).forEach(function(file) {

    if (~file.indexOf('.js')) require(models_path + '/' + file);

});*/
require('./app/models/certificate.js');
require('./app/models/credit-application.model.js');
require('./app/models/major.model.js');
require('./app/models/work-type.model.js');
require('./app/models/user.model.js');

var indexRouter = require('./app/routes/index.router.js');
var certRouter = require('./app/routes/cert.router.js');
var handleError = require('./app/controllers/err.controller.js').handleError;

var app = express();




// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(express.static(path.join(__dirname, 'client')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// app.use(cookieParser());
app.use(session({
    secret: 'some secret word',
    maxAge: 7 * 24 * 60 * 60 * 1000
}))

app.use('/', indexRouter);
app.use('/certs', certRouter);

// ca means `credit application`
app.use('/ca', require('./app/routes/ca.router.js'));
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
	console.log('in 404 error handler')
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

handleError(app);


module.exports = app;
