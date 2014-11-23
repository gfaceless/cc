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

    function addToMajor(major,workType) {
        // according to https://github.com/LearnBoost/mongoose/issues/1335,
        // I'm not worrying the ref array being empty
        var added = major.workTypes.addToSet(workType);
        if(!added.length) {
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
	
	if (!data || !id || !req.body.majorId) return next(new Error());

	Major.findById(req.body.majorId, function(err, major) {
		if(err) return next(err);

		major.workTypes.pull(workTypeId);

		major.save(function(err, major) {
			if(err) return next(err);			

			res.send({
				success: true

			})
		})


	})
}


exports.list = function(req, res, next) {
    WorkType.find()
        .exec(function(err, workTypes) {
            if (err) return next(err);
            res.send({
                success: true,
                workTypes: workTypes
            });
        })

}
