var _ = require('lodash');
var errorTypes = {
    'attack': "E_ATTACK"
}
var util = require('util');

exports.getErrorMsg = getErrorMsg;


exports.record = function (req, res, next) {
    req.errors = [];
    req.recordError = function (err, data) {
        if(!err) return;
        var error = {msg: getErrorMsg(err)}
        if(data) error.data = data;
        req.errors.push(error);
    }
    next();
}

exports.handleError = function(app) {


    /// error handlers
    app.use(function(err, req, res, next) {
        console.log('in error controller..error is: ', util.inspect(err, {showHidden: true, depth: null, colors: true}));
        if(err.status !== 404) {

            // see #http://stackoverflow.com/questions/2923858/how-to-print-a-stack-trace-in-nodejs
            // about err.statck and console.trace
            console.log('stack is:\n'/*, util.inspect(err.stack, {depth: null, colors: true})*/);
            console.log(err.stack);
            // console.trace(err);
        }

        var msg = getErrorMsg(err);
        if (msg) {
            return res.send({
                success: false,
                message: msg
            })
        }

        if (err.type == errorTypes.attack) {
            // maybe do some logging
            console.log('possible attack: ', err);
        }

        next(err);
    });



    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            // seems angularJS does not have X-Requested-With: XMLHttpRequest header
            // so we should judge by Accept header

            if (req.is('application/json')) {
                return res.send({
                    success: false,
                    message: "若出现未知错误，请与王希联系: " + err.message
                });
            }
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

exports.attack = function(msg) {
    return new Error({
        type: errorTypes['attack'],
        message: msg
    });
}

function getErrorMsg(err) {
    var msg = '';

    if (_.isString(err)) msg = err;

    if (err.name == "CastError" || err.name == "ValidationError") {

        msg = "数据验证失败: ";
        var arr = [];
        if (_.isObject(err.errors)) {
            _.forOwn(err.errors, function(error) {
                if (error.message) arr.push(error.message);
            })
        }
        msg += arr.join('; ');

    } 
    // 11001 happens when editing an existing one
    else if (err.name === "MongoError" && (err.code === 11000 || err.code === 11001) ) {
        msg = '证书号重复';        
    }

    return msg || '未知错误';
}
