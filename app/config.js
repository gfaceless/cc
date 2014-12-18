var fs = require('fs');
var Q = require('q');
var config;
var path = require('path');
var _ = require('lodash');

try{
	// store on the disk is sync with RAM
	// we can clear require.cache if we don't restart the server
	config = require('../config.json');
} catch(e){
	config = {}
}


exports.config = config;


exports.isSysMgrCreated = function() {
	return config.sysMgrCreated;
}

exports.isCrapMgrCreated = function() {
	return config.crapMgrCreated;
}

// return a Q
exports.sysMgrCreated = function() {
	return _updateConfig("sysMgrCreated", true);
}

exports.crapMgrCreated = function() {
	return _updateConfig("crapMgrCreated", true);
}
exports.isAllTrue = function() {
	return !_.isEmpty(config) && _.all(config, function(v, k) {
		return v === true;
	})
}


function _updateConfig (key, value) {
	var deferred = Q.defer();
	config[key] = value;
	// do some disk operation
	// what if several disk operation happen at the same time?
	var filePath = path.join(__dirname, '../config.json')
	fs.writeFile(filePath, JSON.stringify(config, null, 4), deferred.makeNodeResolver());

	return deferred.promise;

}

