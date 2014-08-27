module.exports = toXls;

//{{ user.tmp |date('d/m/Y H:i:s') }}
var _ = require('lodash');
var d2cMap = require('../models/certificate/db-map.js');
var chineseKeys = _.values(d2cMap);
var dbKeys = _.keys(d2cMap);

var handlebars = require('handlebars');



/*function heredoc(f) {
    return f.toString().match(/\/\*\s*([\s\S]*?)\s*\*\//m)[1];
}*/


function toXls(data, callback) {
    var source = require('fs').readFileSync(__dirname + '/xls.template', 'utf8');
    var template = handlebars.compile(source);
    var output;
    handlebars.registerHelper('getField', function(dbKey, document) {
        return document[dbKey];
    })


    try {
        output = template({
            certs: data,
            dbKeys: dbKeys,
            chineseKeys: chineseKeys, 
            hasError: _.some(data, 'errMsg')
        });        
    } catch (e) {
        return callback(e)
    }

    var tmp = require('tmp');
    tmp.tmpName({
        postfix: '.xls'
    }, function(err, path) {
        if (err) return callback(err);
        var fs = require('fs');
        fs.writeFile(path, output, function(err) {
            callback(err, path);
        });
    });

}

/*
function toXLS(data, callback) {
    
    
    var tmp = require('tmp');
    tmp.tmpName({postfix: '.xls'}, function (err, path) {
        if (err) return console.log(err);
        try{
            _.each(keys, function(chineseName, i) {
                console.log(0, i, chineseName)
                sht.cell(0, i+1, chineseName, fmtString);
            })
            
            
            sht.cell(3,4,'90023456', fmtString);
                
            
            _.each(data, function(row, i){

                //if(i!==7) return;
                //if(i>17) return;
                
                _.each(values, function(dbprop, j) {
                    var v = row[dbprop];
                    if(_.isString(v) &&/^\d$/.test(v)) v = '';
                    sht.cell(i+1, j, v, fmtString);
                })
            })
        }catch(e){
           console.log(e.name, e.message);
        }

        xlg.end(function(err){
           callback(err, path);
        });
    });
}*/