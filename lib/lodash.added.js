var _ = require('lodash');

_.mixin({"hasKeys": function(obj, keys, anyorAll) {
	// default: all keys must pass
	var method = anyorAll ? "some" : "all"
	return _(keys)[method](function(key) {
		// we ignore null for now
		// Checks if the specified property name exists as a direct property of object, instead of an inherited property.
		if(_.has(obj, key)){
			return true;
		}
	})
}})