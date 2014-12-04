var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('async');


var WorkType = mongoose.model('WorkType');
var Major = mongoose.model('Major');


var error = require('./err.controller.js');



exports.create = function(req, res, next) {

    var data = req.body.major;
    if (!data || !data.name) return next(new Error());

    if (data.name == "wang") return next(new Error());

    var major = new Major(data);

    major.save(function(err, major) {
        if (err) return next(err);
        res.send({
            success: true,
            major: major
        })
    })

}


exports.update = function(req, res, next) {

    var data = req.body.major;
    var id = req.params.id;

    if (!data || !data.name || id === undefined) return next(new Error('not enough info'));

    Major.findById(id, function(err, major) {
        if (err) return next(err);
        if (!major) return next(new Error('no major found'));

        major.name = data.name;

        major.save(function(err, major) {
            if (err) return next(err);
            // should not do this, impact performance
            // and no practical scenario fits
            // exists only temporarily:
            Major.populate(major, {path:'workTypes'}, function(err, major) {
                if(err) return next(err);
                res.send({
                    success: true,
                    major: major
                });
            })
        })
    });


}

exports.remove = function(req, res, next) {
    var data = req.body.major;
    var id = req.params.id;

    if (!data || !data.name || id === undefined) return next(new Error('not enough info'));
    Major.findById(id, function(err, major) {
        if (err) return next(err);
        if (!major) return next(new Error('no major found'));

        major.remove(function(err, major) {
            if (err) return next(err);

            res.send({
                success: true,
                major: major
            });
        })
    });

}


exports.list = function(req, res, next) {

    // because it is for public, TODO: remove some of its field:
    Major
        .find()
        .sort({'_id': -1 })
        .populate('workTypes')
        .exec(function(err, majors) {
            if (err) return next(err);
            res.send({
                success: true,
                majors: majors
            });

        })


}
