var express = require('express');
var router = express.Router();

var fs = require('fs')

var mongoose = require('mongoose');
var _ = require('lodash');
var User = mongoose.model('User');
var config = require('../config.js');



router.post('/sys-mgr', function(req, res, next) {
    if (config.isSysMgrCreated()) {
        // actually we should make the static page unavailable too.
        // figure out a way to do that
        return res.send({success: false, message: "失效"})
        /*return next(404);*/
    }
    next();

}, function(req, res, next) {

    var user = new User({
        name: req.body.name,
        password: req.body.password,
        role: "sysMgr"
    })

    user.save(function(err, user) {
        if (err) return next(err);
        next()
    });


}, function(req, res) {

    config.sysMgrCreated()
        .done(function() {
            res.send({
                success: true
            })
        }, function(err) {
            res.send({
                success: false,
                message: err
            });
        })

})


router.post('/crap-mgr', function(req, res, next) {
    if (config.isCrapMgrCreated()) {
        return res.send({success: false, message: "失效"})
    }
    next();

}, function(req, res, next) {

    var user = new User({
        name: req.body.name,
        password: req.body.password,
        role: "crapMgr"
    })

    user.save(function(err, user) {
        if (err) return next(err);
        next()
    });


}, function(req, res) {

    config.crapMgrCreated()
        .done(function() {
            res.send({
                success: true
            })
        }, function(err) {
            res.send({
                success: false,
                message: err
            });
        })
})


router.get('/is-available', function(req, res, next) {
    if (config.isAllTrue()) {
        res.send({
            success: false,
            message: "该页面失效了"
        })
    } else {
        res.send({
            success: true
        })
    }
})


module.exports = router;
