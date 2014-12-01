// var auth = require('../lib/auth.js');

/*var credApplCtrl = require('./controllers/ca.controller.js');
var majorCtrl = require('./controllers/major.controller.js');
var workTypeCtrl = require('./controllers/work-type.controller.js');*/

// auth.grant('credApplMgr', [credApplCtrl, majorCtrl, workTypeCtrl]);

var _ = require('lodash');
var perm = {};
module.exports = perm;

perm.allow = function(roles) {
	if(!_.isArray(roles)) roles = [roles];

	return function(req, res, next) {
		if(perm._hasRole(roles, req.session.role)) {next();}
		else {next('没有权限');}
	}
}

perm._hasRole = function(roles, role) {
	// if session needs to be small, we could use number for role here
	return _.contains (roles, role);
}