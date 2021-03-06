// we should rename this file to cred-appl.model.js
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    _ = require('lodash')    

var Q = require('q');
var moment = require('moment');

var caSchema = new Schema({

	cert: { type: Schema.Types.ObjectId, ref: 'Certificate', required: true, unique: true},

	major: { type: Schema.Types.ObjectId, ref: 'Major', required: true },

	// if 'default' supports async function, I would love to use it here
	_id: { type: String, required: true, unique: true},
	// http://en.wikipedia.org/wiki/Student_number
	studNumber: {type: String, required: true},
	appliedDate: { type: Date, default: function() {return new Date()}}
});


caSchema.path('studNumber').validate(function (value) {
  	var re = /^20\d{2}\d{3}[1-3]\d{7}$/;
  	if(!re.test(value)) return false;
}, '({PATH})  数据`{VALUE}`未验证通过: 不是合理的学号');

caSchema.static('generateId', function(seed) {
	var prefix = moment().format('YYYYMMDD');
	
	return prefix + String("000000" + seed).slice(-6);	
	
})


var counterSchema = new Schema({

	seq: { type: Number, required: true },
	name: {type: String, required: true}/*,
	year: {type: String, required: true}*/


});

counterSchema.static('getNextSequence', function(name) {
	var deferred = Q.defer();
	name += moment().format('YYYY')
	var options = {
		new: true,
		upsert: true
	}
	this.findOneAndUpdate({name: name}, {$inc: {seq: 1}}, options)
		.exec(function(err, data) {
			if(err) {deferred.reject(err);}
			else{
				deferred.resolve(data.seq);
			}

		})

	return deferred.promise;
})





mongoose.model('CreditApplication', caSchema);
var Counter = mongoose.model('Counter', counterSchema);

