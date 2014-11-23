// ca: credit application


var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('async');

var Certificate = mongoose.model('Certificate');
var WorkType = mongoose.model('WorkType');
var Major = mongoose.model('Major');
var CA = mongoose.model('CreditApplication');

var error = require('./err.controller.js');
var moment = require('moment')

/*
 *  do some data completeness check, as well as some sanitation
 */
function preApply(req, res, next) {

    var cert = req.body.cert;
    if (!cert) return next(new Error());

    if (!cert.name || !cert.idnumber || !cert.certnumber) return next(new Error('not full info'));

    if (!req.body.majorId) return next(new Error('no majorId'));

    next();

}



exports.creditApply = [preApply, function(req, res, next) {

    // req.body is already guaranteed to be appropriate   
    var majorId = req.body.majorId;

    Certificate.findOne(req.body.cert, function(err, cert) {
        if (err) return next(err);

        // reason 0: has no cert.
        if (!cert) {
            return res.send({
                success: false,
                reason: 1
            });
        }

        Major
            .findById(majorId)
            .populate('workTypes')
            .exec(function(err, major) {
                if (err) return next(err);

                if (!major) {
                    return next(new Error('no such major'))
                }

                var inArray = _(major.workTypes).pluck('name').contains(cert.worktype);
                if (!inArray) {
                    return res.send({
                        success: false,
                        reason: 2
                    })
                }

                var ca = new CA({
                    cert: cert,
                    major: majorId
                })

                ca.save(function(err, ca) {
                    if (err) return next(err);
                    var report = {};
                    _.assign(report, cert.toObject());
                    
                    report.appliedDate = moment(ca.appliedDate).format('YYYY-MM-DD');
                    report.major = major.name;
                    res.send({
                        success: true,
                        report: report
                    })
                })

            })



    })

}]
