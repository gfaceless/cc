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
		if(err) return next(err);
		if(!major) return next(new Error('no major, maybe should have used error.attack()'));

		var workType = new WorkType(data);

		workType.save(function(err, workType) {
			if(err) return next(err);
			
			// according to https://github.com/LearnBoost/mongoose/issues/1335,
			// I'm not worrying the ref array being empty
			major.workTypes.push(workType);
			major.save(function(err, major) {
				if(err) return next(err);
				res.send({success: true, workType: workType});
			})
		})	


	})	
	
}


exports.list = function(req, res, next) {
	WorkType.find()
	.exec(function(err, workTypes) {
		if(err) return next(err);
		res.send({success: true, workTypes: workTypes});
	})

}