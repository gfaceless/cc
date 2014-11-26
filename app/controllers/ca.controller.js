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


    // TODO: use async
    Certificate.findOne(req.body.cert, function(err, cert) {
        if (err) return next(err);

        // reason 0: has no cert.
        if (!cert) {
            return res.send({
                success: false,
                reason: 1
            });
        }

        if( ! isApplicable(cert.certnumber) ) {
            return res.send({
                success: false,
                reason: 3
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

                CA.findOne({
                    cert: cert._id
                })
                .populate('major cert')
                .exec( function(err, ca) {
                    function makeReport(ca) {
                        
                        var report = {};
                        _.assign(report, ca.cert.toObject());
                        report.appliedDate = moment(ca.appliedDate).format('YYYY-MM-DD');
                        report.major = ca.major && ca.major.name;
                        return report;
                    }

                    if (err) return next(err);
                    if (ca) {
                        var report = makeReport(ca);

                        // try using async, to sement res.send logic together
                        res.send({
                            success: true,
                            report: report,
                            appliedTime: moment(ca.appliedDate).format('YYYY-MM-DD HH:mm'),
                            hasApplied: true
                        })
                        return;
                    }
                    // when there is no ca in db:
                    ca = new CA({
                        cert: cert,
                        major: majorId
                    })

                    ca.save(function(err, ca) {
                        if (err) return next(err);
                        CA.populate(ca, {path:"major cert"}, function(err, ca) {
                            console.log(ca);
                            res.send({
                                success: true,
                                report: makeReport(ca)
                            })                            
                        })

                    })
                })

            })
    })

}]


exports.list = function(req, res, next) {
    var query = req.query;

    //defaults:
    var page = query.page || 1;
    var limit = query.limit || 10;

    CA.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('cert major')
        .lean()
        .exec(function(err, arr) {
            if (err) return next(err);
            
            

            var ret = _.transform(arr, function(result, val, key) {
                
                _.defaults(val, val.cert);
                delete val.cert;
                val.major = val.major && val.major.name;
                val.appliedDate = moment(val.appliedDate).format('YYYY-MM-DD HH:mm')
                /*maybe we should put the following logic into model*/
                // applicable education level:
                val.applEduLvl = toApplEduLvl (val.certnumber);

                result[key] = val;
            })

            




            
            res.send({success: true, results: ret});
        })
}

function isApplicable(certnumber) {
    var digit = parseInt(certnumber[10], 10);
    return digit <=3;
}
function toApplEduLvl(certnumber) {
    var digit = parseInt(certnumber[10], 10);
    if(digit <= 2) return "本科";
    if(digit == 3) return "专科、本科";
    return "错误"
}