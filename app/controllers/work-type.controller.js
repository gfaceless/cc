var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('async');


var WorkType = mongoose.model('WorkType');
var Major = mongoose.model('Major');


var error = require('./err.controller.js');



module.exports.create = function(req, res, next) {

    var data = req.body.workType;
    if (!data || !data.name || !req.body.majorId) return next(new Error());


    Major.findById(req.body.majorId, function(err, major) {
        if (err) return next(err);
        if (!major) return next(new Error('no major, maybe should have used error.attack()'));

        WorkType.findOne({
            name: data.name
        }, function(err, workType) {
            if (err) return next(err);
            // workType would be null if not found.
            if (!workType) {
                workType = new WorkType(data);

                workType.save(function(err, workType) {
                    if (err) return next(err);
                    addToMajor(major, workType);
                })
                return;
            }
            addToMajor(major, workType);
        })
    })

    function addToMajor(major, workType) {
        // according to https://github.com/LearnBoost/mongoose/issues/1335,
        // I'm not worrying the ref array being empty
        var added = major.workTypes.addToSet(workType);
        if (!added.length) {
            return res.send({
                success: false,
                message: "该专业已有该工种"
            })
        }

        major.save(function(err, major) {
            if (err) return next(err);
            res.send({
                success: true,
                workType: workType
            });
        })
    }
}

exports.update = function(req, res, next) {
    var data = req.body.workType;
    var workTypeId = req.params.id;
    if (!data || !id || !req.body.majorId) return next(new Error());


}

// it seems expressjs won't fill req.body if the requested method is DELETE, so I use post instead.
// this only remove it from major's workTypes array
exports.removeFromMajor = function(req, res, next) {
    var data = req.body.workType;

    var workTypeId = req.params.id;

    if (!data || !isObjectId(workTypeId) || !req.body.majorId) return next(new Error('something went wrong'));

    // we can use findById too
    Major.findOne({
        _id: req.body.majorId
    }, function(err, major) {
        if (err) return next(err);
        if (!major) {
            return next(new Error('no major found'));
        }
        // here happens type cast. string -> ObjectId.
        // if not sure, we should wrap it in try/catch, or else the app would fail due to a throwed error.
        major.workTypes.pull(workTypeId);

        major.save(function(err, major) {
            if (err) return next(err);

            res.send({
                success: true

            })
        })


    })
}


exports.list = function(req, res, next) {
    Major.find()
        .populate('workTypes')
        .exec(function(err, majors) {
            if (err) return next(err);
            if (!majors.length) return res.send({
                success: false
            });
            var ret = _(majors).map(function(major) {
                    return major.workTypes

                })
                // I want to use _.union but it only works if I code like this:
                // _.union.apply(null, results);
                // so I choose to flatten and then uniq
                .flatten()
                // lodash uniq will compare using strict equal
                // here the items are all object
                // it works because `mongoose populate` creates object reference
                // instead of copying.
                .unique()
                .value()
            res.send({
                success: true,
                workTypes: ret
            });
            console.log(ret);
        })



}

function isObjectId(n) {
    return mongoose.Types.ObjectId.isValid(n);
}
