// ca: credit application


var mongoose = require('mongoose');
var _ = require('lodash');
require('../../lib/lodash.added.js');
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

        // reason 3: not applicable
        if (!isApplicable(cert.certnumber)) {
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

                // reason 2: specified major does not have specified worktype.
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
                    .exec(function(err, ca) {
                        function makeReport(ca) {

                            var report = {};
                            _.assign(report, ca.cert.toObject());
                            report.applEduLvl = toApplEduLvl(report.certnumber);
                            report.appliedDate = moment(ca.appliedDate).format('YYYY-MM-DD');
                            report.major = ca.major && ca.major.name;
                            return report;
                        }

                        function onSaved(err, ca) {
                            if (err) return next(err);
                            CA.populate(ca, {
                                path: "major cert"
                            }, function(err, ca) {
                                res.send({
                                    success: true,
                                    report: makeReport(ca)
                                })
                            })
                        }

                        if (err) return next(err);
                        
                        if(ca && !req.body.updating){
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
                        if (!ca) {
                            ca = new CA({
                                cert: cert,
                                major: majorId
                            })
                        }

                        if (req.body.updating) {
                            // this is when student wants to change his major
                            // we could alo change appliedDate here
                            ca.major = majorId;
                            ca.appliedDate = new Date();
                        } 
                        ca.save(onSaved);
                    })

            })
    })

}]

exports.list = [search, function(req, res, next) {
    if (!req.results || !req.results.length) {
        res.send({
            success: false,
            message: "查无结果"
        })
    } else {
        res.send({
            success: true,
            results: req.results,
            total: req.total
        })
    }
}]

var defDateRange = [new Date('2014-12-01'), new Date()];

function search(req, res, next) {
    //defaults:
    var page = req.query.page || 1;
    var limit = req.query.limit || 10;


    // we'll add date filter later
    var criteria = _.pick(req.query, ['major']);
    var certs;
    // due to my poor data model design, I have to do such things:
    // in other places we should use workype instead of worktype, the latter is a debris
    var fields = ['name', 'idnumber', 'certnumber', 'worktype'];
    // this is custom method added by me:
    // 3rd param true means if any prop in fields is found, the result is true
    if (_.hasKeys(req.query, fields, true)) {
        // first we check Certificates dbcollection:
        Certificate
            .find(_.pick(req.query, fields))
            .select("_id")
            .exec(function(err, arr) {
                if (err) return next(err);
                if (!arr.length) {
                    req.results = arr;
                    return next();
                }
                certs = arr;
                credApplFind();
            })

    } else {
        // if no cert info passed, (just major or date), we search it right away:
        credApplFind();
    }

    function credApplFind() {
        var query = CA.find(criteria)
        var queryCount = CA.find(criteria)

        if (certs) {
            // TODO: this is fucking slow, esp when certs is large
            // go and find some clever trick to circumvent this
            // maybe mongodb mapReduce?
            query.where('cert').in(certs)
            queryCount.where('cert').in(certs)
        }
        if (!req.query.excel) {
            query.skip((page - 1) * limit)
                .limit(limit)
        }

        // handle date range query:
        var from = req.query.from;
        var to = req.query.to;
        console.log(from, to);
        if(from || to){
            var from = from || defDateRange[0];
            var to = to || defDateRange[1];            

            query.where('appliedDate', {
                $gte: from,
                // add 1 day (to the 12 clock in the evening of that day)
                // toDate() helps momentjs convert to native Date
                // http://momentjs.com/docs/#/displaying/as-javascript-date/
                $lte: moment(to).add(1, 'd').toDate(),
            })
        }

        query.populate('cert major')
            .lean()
            .exec(function(err, arr) {
                if (err) return next(err);
                if (!arr.length) {
                    req.results = arr;
                    return next();
                }

                var ret = _.transform(arr, function(result, val, key) {

                        _.defaults(val, val.cert);
                        delete val.cert;
                        val.major = val.major && val.major.name;
                        val.appliedDate = moment(val.appliedDate).format('YYYY-MM-DD HH:mm')
                            /*maybe we should put the following logic into model*/
                            // applicable education level:
                        val.applEduLvl = toApplEduLvl(val.certnumber);

                        result[key] = val;
                    })
                    // How can we skip this round-trip?

                queryCount.count(function(err, total) {
                    req.results = ret;
                    req.total = total;
                    next();
                })

            })
    }
}


exports.remove = function(req, res, next) {
    var id = req.params.id;
    if (id === undefined) return next("wrong")
    CA.findOneAndRemove({
            _id: id
        })
        .exec(function(err, data) {
            if (err) return next(err, data);
            res.send({
                success: true,
                result: data
            })
        })

}




function isApplicable(certnumber) {
    var digit = parseInt(certnumber[10], 10);
    return digit <= 3;
}

function toApplEduLvl(certnumber) {
    var digit = parseInt(certnumber[10], 10);
    if (digit <= 2) return "本科";
    if (digit == 3) return "专科、本科";
    return "错误"
}



exports.toExcel = [search, function(req, res, next) {
    //TODO: optimize the initiation
    var xlsx = require('node-xlsx');
    // we should use stream here

    var map = {
        "_id": "认证编号",
        "name": "姓名",
        idnumber: "身份证号",
        certnumber: "证书号",
        worktype: "工种",
        applEduLvl: "可置换专业层次",
        major: "申报专业",
        appliedDate: "申报日期"
    }
    var keys = _.keys(map);
    // excel header name
    var headerNames = _.values(map);

    var data = _.map(req.results, function(item) {
        var ret = [];
        // the order is not guaranteed across different env,
        // but it is consistent in one os.
        _.forOwn(map, function(v, k) {
            ret.push(item[k] || "");
        })
        return ret;
    })

    data.unshift(headerNames);


    var buffer = xlsx.build([{
        name: "申请结果",
        data: data
    }]);


    // TODO: of course I should make it a stream, shouldn't create files
    var tmp = require('tmp');
    tmp.tmpName({
        postfix: '.xlsx'
    }, function(err, path) {
        if (err) return next(err);
        var fs = require('fs');
        fs.writeFile(path, buffer, function(err) {
            if (err) return next(err);
            res.download(path, 'report.xlsx', function(err) {
                if (err) return next(err);
            });
        });
    });


}]
