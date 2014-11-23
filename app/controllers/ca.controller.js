// ca: credit application


var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('async');

var Certificate = mongoose.model('Certificate');
var WorkType = mongoose.model('WorkType');
var Major = mongoose.model('Major');
var CA = mongoose.model('CreditApplication');

var error = require('./err.controller.js');

/*
 *  do some data completeness check, as well as some sanitation
 */
function preApply(req, res, next) {
	

	

	var cert = req.body.cert;
	if(!cert) return next(new Error());

	if(!cert.name || !cert.idnumber || !cert.certnumber) return next(new Error('not full info'));
	// TODO: we should remove extra info from req.body.ca.cert

	if(!req.body.workTypeId) return next(new Error('no workTypeId'));

	WorkType.find({id: req.body.workTypeId}, function(err, workType) {
		if(err) return next(err);
		// not matching db, possibly an attack
		if(!workType) return next(new Error('wtf? not correct work-type'))
		
		// if mongoose does not do ObjectId transform, we can do `cert.workType = workType._id` here.
		next();
	})

}



exports.creditApply = [ preApply, function(req, res, next) {

	// req.body is already guaranteed to be appropriate   


    Certificate.findOne(req.body.cert, function(err, cert) {
    	if(err) return next(err);
        // cert._id = mongoose.Types.ObjectId();
    	var ca = new CA({
    		cert: cert,
    		workType: req.body.workTypeId
    	})

    	ca.save(function(err, ca) {
    		if(err) return next(err);
    		console.log(ca);
    		// TODO: we should query Major here, and return it with ca
    		
            /*var report ={};
            _.assign(report, ca.cert);
            report.major = ca.major;
            report.appliedDate = ca.appliedDate*/
            
            res.send({
    			success: true,
    			ca: ca
    		})
    	})

    })

}]