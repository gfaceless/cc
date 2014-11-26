var _ = require('lodash');


var auth = {};

module.exports = auth;

var pool = {};

auth.grant = function(role, ctrls) {
    if (!pool[role]) pool[role] = [];

    if(!_.isArray(ctrls)) {
    	// we should warn the programmer who use this api.
    	// we must pass ctrls as an array
    	// this is because some controller method is an array of middlewares.
    	// we can not distinguish them from others if ctrls is free-form
    	throw new Error('ctrls must be an array')
    	return;
    }

    // ctrls is possibly an array of array:
    ctrls = _.map(ctrls, function(ctrl) {
        if (_.isFunction(ctrl)) return ctrl;

        if (_.isObject(ctrl)) {
        	// gather all of its function values.
            return _.transform(ctrl, function(result, val) {
            	// as noted aboe, value could be an array of middlewares
            	if(_.isFunction(val) || _.isArray(val)) result.push(val);
            }, [])
        }
    })

    
    // actually unique is not necessary.
    // shadow flatten is necessary, as noted above.
    pool[role] = _.union(pool[role], _.flatten(ctrls, true));

 	
    _.each(pool[role], function(val,num) {
    	console.log(_.isArray(val));
    	console.log(val.toString());

    	if(num>3) return false;
    })
}
