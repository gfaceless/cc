var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session')
var methodOverride = require('method-override')

var util = require('util')
var fs = require('fs');
var _ = require('lodash');
var mongoose = require('mongoose');
require('./lib/mongoose-error-msg.js');

function reconnect(argument) {
    mongoose.connect('mongodb://localhost/test');
}

// my makeshift for this app to run if mongodb is not connected
// may be wrong
mongoose.connection
    .on('error', function(err) {
        if (_.contains(err.message, "failed to connect")) {
            setTimeout(function() {
                console.log('reconnecting');
                reconnect();
            }, 5000);
        }
    })
    .on('connected', function() {
        app.emit('done')
    })

reconnect();


var models_path = __dirname + '/app/models';
/*fs.readdirSync(models_path).forEach(function(file) {

    if (~file.indexOf('.js')) require(models_path + '/' + file);

});*/
require('./app/models/certificate.js');
require('./app/models/credit-application.model.js');
require('./app/models/major.model.js');
require('./app/models/work-type.model.js');
require('./app/models/user.model.js');
require('./app/models/article.model.js');

var indexRouter = require('./app/routes/index.router.js');
var certRouter = require('./app/routes/cert.router.js');
var handleError = require('./app/controllers/err.controller.js').handleError;

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

app.use(favicon());

//temp:
app.use(function(req, res, next) {
    if (req.originalUrl == '/ca/ca.html') {
        return res.redirect('/ca/');
    }
    if (req.originalUrl == '/ca/admin/ca.admin.html') {
        return res.redirect('/ca/admin/');
    }
    next();
})


/*app.use(function(req, res, next) {
    if(req.path != '/ca/admin/ca-results'){
        return next();
    }
    setTimeout(function() {
        next();
    }, 5000);
})*/

var publicFolder = path.join(__dirname, 'client');

// I want all .html files to have `cache-control: max-age:0`
// but it is hard to achieve when trailing slash indicates possible .html files
// if I had time, I would love to dive in these code bases and maybe do some forks:
// #https://github.com/expressjs/serve-static/blob/master/index.js
// #https://github.com/pillarjs/send/blob/master/index.js
// for now, a makeshift:

app.use(function(req, res, next) {
        var options = {
            maxAge: 0, // it is default
        }

        var hasTrailingSlash = /\/$/.test(req.path);

        if(/\.html$/.test(req.path) || hasTrailingSlash){
            var p  = path.join(publicFolder, req.path);
            if(hasTrailingSlash) {
                p += "index.html";
            }
            return res.sendFile(p, options)
        }

        next();
    })

// as I have added footprint to my static file, cache-control should be set at a large number
// remember that some pages' footprint remains to be set
app.use(express.static(publicFolder, {
    maxAge: "365d"
}));

app.use(logger('dev'));

app.use(methodOverride());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
// app.use(cookieParser());
app.use(session({
    secret: 'some secret word',
    maxAge: 7 * 24 * 60 * 60 * 1000
}))

app.use('/', indexRouter);
app.use('/certs', certRouter);
app.use('/config', require('./app/routes/config.router.js'));

// ca means `credit application`
app.use('/ca', require('./app/routes/ca.router.js'));
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

handleError(app);


module.exports = app;

// #http://stackoverflow.com/questions/7310521/node-js-best-practice-exception-handling
// they suggest using nodejs new feature 'domain', but I just can't grasp that concept
// maybe later
/*process.on('uncaughtException', function(err) {
    console.log("something severe happens, we need to restart our program, the err is: ", err)
})*/
