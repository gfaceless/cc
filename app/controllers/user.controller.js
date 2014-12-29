var mongoose = require('mongoose');
var _ = require('lodash');
var User = mongoose.model('User');

var error = require('./err.controller.js');


exports.auth = function(req, res, next) {

    if (!req.session.isAdmin) return next('没有权限');
    next();

}

exports.login = function(req, res, next) {
    var u = req.body.user;
    if (!u) return next('no user specified');
    // do User.findByName
 
    User.findOne({
            name: u.name
        })
        .exec(function(err, user) {
            if (err) return next(err);
            
            
            if (user && (user.password == User.hashPass(u.password))) {
                req.session.role = user.role;
                res.send({
                    success: true,
                    user: {role: user.role, name: user.name}
                })

            } else {
                res
                    .status(500)
                    .send({
                        message: "用户名或密码错误"
                    })
            }
        })

}

exports.logout = function(req, res, next) {
    req.session = null;
    res.send({
        success: true
    })
}

// TODO: rename it to getUserInfo, and return username as well
exports.isLogged = function(req, res, next) {
    // tmp way:
    var logged = !!req.session.role;

    res.send({        
        role: req.session.role,
        logged: logged
    })
}

exports.list = function(req, res, next) {
    User.find({
            role: "crapSubMgr"
        })
        // even if _id is omitted, still included
        .select('name')
        .sort({
            "_id": -1
        })
        .exec(function(err, users) {
            if (err) return next(err);
            if (!users.length) return res.send({
                success: false,
                message: "查无结果"
            })
            res.send({
                success: true,
                users: users
            });
        })

}

exports.create = function(req, res, next) {
    var u = req.body.user;
    if (!_.isObject(u) || !u.name || !u.password) return next("wrong!");
    var user = new User(req.body.user);

    user.role = "crapSubMgr";

    user.save(function(err, user) {
        if (err) return next(err);
        user = user.toObject();
        delete user.password;
        res.send({
            success: true,
            user: user
        });
    })

}

exports.update = function(req, res, next) {

    var u = req.body.user;
    if (!_.isObject(u)) return next(new Error('wtf!'));

    User.findById(req.params.id, function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('wtf!'));

        user.name = u.name
        // yes, setter will help us do the hash
        user.password = u.password;
        user.save(function(err, user) {
            if (err) return next(err);

            user = user.toObject();
            delete user.password;
            res.send({
                success: true,
                user: user
            });
        })
    })
}

exports.remove = function(req, res, next) {
    User.findByIdAndRemove(req.params.id, function(err, data) {
        if (err) return next(err);
        res.send({
            success: true,
            data: data
        });
    })
}
