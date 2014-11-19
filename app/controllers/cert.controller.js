var cert = {};
module.exports = cert;

var mongoose = require('mongoose');
var Certificate = mongoose.model('Certificate');
var _ = require('lodash');
var util = require('util');
var async = require('async');
var x2j = require("xls-to-json");
var toXls = require('./cert.to-xls.js');
var multiparty = require('multiparty');
var error = require('./err.controller.js');

// database to chinese map:
var db2cMap = require('../models/certificate/db-map.js');
// chinese to database map:
var c2dbMap = _.invert(db2cMap);

var map = {
    "身份证号": 'idnumber',
    "考生姓名": "name",
    "申报工种": "worktype",
    "鉴定级别": "certlevel",
    "证书号": "certnumber",
    "出生日期": "birth",
    "性别": "sex",
    "文化程度": "edu",
    "理论成绩": 'tscore',
    "实操成绩": 'pscore',
    "评定成绩": 'record',
    "颁证日期": "certdate",
    "有效至": "expire",
    "单位名称": "danwei",
    "鉴定机构": "certfacility",
    "证书类别": "certcat",
};

var chineseNames = _.keys(map);
var dbNames = _.values(map);



cert.create = function(req, res, next) {

    var data = req.body.cert;

    if (!data) return next(new Error());

    var cert = new Certificate(data);
    cert.save(function(err, cert) {

        if (err) return next(err);
        res.send({
            success: true,
            result: cert
        })
    });
}


var defaultRange = {
    score: [0, 100],
    date: [new Date('1970-10-19'), new Date()]
}


cert.read = [preSearch,
    function(req, res, next) {
        var query = req.query;

        //defaults:
        var page = query.page || 1;
        var limit = query.limit || 10;

        if(! query.cert )return;

        query.cert = _.transform (query.cert, function(result, value, key) {
            if(!_.isArray(value)) {result[key] = value;return;}
            if( value.length > 2 || (_.isEmpty(value[0])&& _.isEmpty(value[1]) ) ) return;
            var regMatch = key.match(/score|date/);
            if(!regMatch) return;
            var regKey = regMatch[0];
            
            result[key] = {$gte: value[0] || defaultRange[regKey][0] , $lte: value[1] || defaultRange[regKey][1]}
            
        })
        console.log('query.cert is: ', query.cert);
        console.log('query time is: ', new Date());
        Certificate.find(query.cert)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec(function(err, data) {
                if (err) return next(err);
                if (!data || !data.length) {
                    return res.send({
                        success: false,
                        message: "查无结果"
                    })
                }
                // TODO: we can skip count if only a few items returned
                Certificate.count(query.cert, function(err, total) {
                    if (err) return next(err);
                    // here is where that weird bug happens
                    // maybe I can try, catch
                    res.send({
                        success: true,
                        results: data,
                        total: total
                    });

                })
            });
    }
];

cert.update = function(req, res, next) {
    var data = req.body.cert;
    var id = req.params.id;
    if (!data) return next(error.attack());

    Certificate.findById(id, function(err, cert) {
        if (err) return next(err);
        if (!cert) {
            res.send({
                success: false,
                message: 'no cert found'
            });
            return;
        }
        // TODO: THIS IS DANGEROUS: CONFINE IT
        _.assign(cert, data);

        cert.save(function(err, cert) {

            if (err) return next(err);
            res.send({
                success: true,
                result: cert
            });
        });

    });
};

cert.delete = function(req, res, next) {
    var id = req.params.id;
    if (!id) return next(error.attack('no id in delete function'));

    Certificate.findById(id, function(err, cert) {
        if (err) return next(err);
        cert.remove(function(err, data) {
            if (err) return next(err);
            res.send({
                success: true,
                result: data
            })
        });
    })
};

cert.export = function(req, res, next) {

    // NOTICE: for Certificate.find, req.query.cert could be undefind, but it would be treated the same as it is an empty obj
    Certificate.find(req.query.cert)
        .exec(function(err, certs) {
            if (err) return next(err);

            if (!certs || !certs.length) {
                return res.send({
                    success: false,
                    message: "查无结果"
                })
            }

            if (certs.length >= 65000) {
                return res.send({
                    success: false,
                    message: "too many"
                })
            }


            toXls(certs, function(err, xlspath) {

                /*res.setHeader('Content-Type', 'application/vnd.ms-excel');
                    res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xls");                    
                    res.end(xls, 'utf8');*/

                if (err) return next(err);
                res.download(xlspath, 'report.xls', function(err) {
                    if (err) return next(err);
                });
            });


        });
};
cert.download = function(req, res, next) {
    var fileName = req.params.fileName;
    if (!fileName) return next('no file name?');
    /* I assume that my require('tmp') module use the same OS tmp option*/
    var tmpdir = require('os').tmpdir();
    res.download(tmpdir + '/' + fileName, 'error-report.xls', function(err) {
        if (err) return next(err);
    })
}

cert.upload = [error.record,
    function(req, res, next) {

        var form = new multiparty.Form();

        form.parse(req, function(err, fields, files) {
            if (err) return next(err);
            try {
                var path = files.file[0].path;
            } catch (e) {
                return next(e)
            }
            if (!path) return next('上传失败');

            /**
             * transform object {idnumber: "123"} to object {"身份证号": "123"}
             * @param  {[type]} arr
             * @return {[type]}
             */
            function transform(arr) {
                return _.map(arr, function(data) {
                    return _.transform(data, function(result, v, k) {
                        var dbkey = c2dbMap[k];
                        result[dbkey] = v;
                    })
                })
            }
            try {
                x2j({
                    input: path,
                    output: null
                }, function(err, results) {
                    if (err) return next(err);

                    var certs = transform(results);

                    var info = {
                        total: certs.length,
                        create: 0,
                        update: 0
                    };

                    async.eachSeries(certs, function(cert, callback) {

                        Certificate.findOne({
                            certnumber: cert.certnumber
                        }, function(err, doc) {
                            var index = certs.indexOf(cert);
                            var isNew;
                            if (err) {
                                req.recordError(err, cert);
                                return callback();
                            }
                            if (!doc) {
                                doc = new Certificate(cert);
                                ifNew = true;
                            } else {
                                _.assign(doc, cert);
                                isNew = false;
                            }
                            doc.save(function(err, doc) {
                                if (err) {
                                    req.recordError(err, cert);
                                } else {
                                    info[isNew ? 'create' : 'update'] += 1;
                                }
                                callback();
                            });

                        });

                    }, function(err) {
                        if (err) return next(err);
                        // res.header("Content-Type", "application/json; charset=utf-8");

                        var send = {
                            // always true, even no record is saved
                            success: true /*info.total > req.errors.length*/ ,
                            info: info,
                            errors: req.errors
                        }

                        _.each(req.errors, function(error) {
                            error.index = _.indexOf(certs, error.data);
                        });
                        // consider delete error.data here:
                        if (!req.errors.length) return res.send(send);

                        var certsWithErr = _.reduce(req.errors, function(result, error) {
                            var o = error.data;
                            o.errMsg = error.msg;
                            result.push(o)
                            return result;
                        }, []);



                        toXls(certsWithErr, function(err, path) {
                            if (err) return next(err);
                            send.href = require('path').basename(path);
                            res.send(send);
                        })
                    });
                });

            } catch (e) {
                return next(e)
            }


        });


    }
]

cert.csv = [error.record,
    function(req, res, next) {
        var count = 0;
        var existed = 0;
        var csvPath = 'e:/tmp/go-final.csv';
        var csv = require('csv');
        var fs = require('fs');
        var dest = 'e:/errors.xls';
        /*var EOL = require('os').EOL;
    
    var log = fs.createWriteStream('e:/log.txt', {
        'flags': 'a'
    });*/


        var headers = ["id", "idnumber", "name", "sex", "certnumber", "type", "worktype", "certlevel",
            "certdate", "cgry", "tscore", "pscore", "edu", "record", "wbbz", "intime"
        ]

        var levelMap = {
            1: '高级技师',
            2: '技师',
            3: '高级',
            4: '中级',
            5: '初级'
        }


        var transformer = csv.transform(function(row, callback) {

            var cert = {};
            _(row).forEach(function(v, i) {
                var header = headers[i];
                if (_.contains(dbNames, header)) {
                    cert[header] = i == 7 ? levelMap[v] : v;
                    cert[header] = cert[header].trim();
                }
            })
            cert.certfacility = '机械工业职业技能鉴定指导中心';

            Certificate.findOne({
                certnumber: cert.certnumber.trim()
            }, function(err, doc) {


                if (err) return next(err);
                if (doc) {
                    existed++
                }

                doc = new Certificate(cert);

                doc.save(function(err) {

                    if (err) req.recordError(err, cert);

                    /* write to log*/
                    /*if (err) {
                    log.write(error.getErrorMsg(err) + ": " + EOL);
                    var arr = [];
                    _.forOwn(doc._doc, function(v, k) {
                        var index = _.indexOf(dbNames, k);
                        if (index < 0) return;
                        arr.push(chineseNames[index] + ': ' + v);
                    })
                    log.write(arr.join('; ') + EOL + EOL);
                    }*/
                    ++count;
                    if (!(count % 500)) console.log(count);
                    callback();
                });

            });
        }, {
            parallel: 1
        });



        fs.createReadStream(csvPath)
            .pipe(csv.parse())
            .pipe(transformer)
            .on('end', function() {
                console.log('Number of lines: ' + count);
                console.log('existed docs: ', existed);
                if (!req.errors.length) return;
                var certsWithErr = _.reduce(req.errors, function(result, error) {
                    var o = error.data;
                    o.errMsg = error.msg;
                    result.push(o)
                    return result;
                }, []);


                toXls(certsWithErr, function(err, path) {
                    if (err) return next(err);
                    fs.createReadStream(path).pipe(fs.createWriteStream(dest));
                    console.log('fin');
                })
            })
            .on('error', function(error) {

            })
            .pipe(process.stdout)

    }
]


function preSearch(req, res, next) {
    var cert = req.query.cert || req.body.cert;

    if (!_.isObject(cert)) return next(error.attack('cert should be an object'));

    if (_.isString(cert.idnumber)) cert.idnumber = cert.idnumber.toLowerCase();
    next();

}

cert.prePublicSearch = [preSearch,
    function(req, res, next) {
        // cert is already guaranteed to be an object
        var cert = req.query.cert;
        if (!(cert.idnumber && cert.name)) return next('not enough info')
        next();
    }
]




cert.removeNameSpace = function(req, res, next) {
    var errors = [];

    Certificate.find({name: /\s/}, function(err, arr) {
        console.log(arr.length);
        async.each(arr, function(row, callback) {
            row.name = row.name.replace(/\s/g, '');
            row.save(function(err) {
                if(err) errors.push(err);
                callback();                
            });
            
        }, function(err) {
            console.log(errors);
            Certificate.count({name: /\s/}, function(err, total) {console.log(total)});
        })
        
    })
}