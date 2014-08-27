var _ = require('lodash');
var urlParser = function(req, res, next) {
    // only one level        
    _(req.query).each(function(v, k, o) {
        try {
            o[k] = JSON.parse(v)
        }catch(e) {}
    })    
    next();
}

module.exports = urlParser;