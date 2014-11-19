var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    _ = require('lodash')    


var caSchema = new Schema({

	cert: { type: Schema.Types.ObjectId, ref: 'Certificate', required: true },

	workType: { type: Schema.Types.ObjectId, ref: 'WorkType', required: true },

	appliedDate: { type: Date, default: function() {return new Date()}}
});


caSchema.path('appliedDate').set(function(val) {
	console.log('appliedDate is %s', val);
	return val;
})


mongoose.model('CreditApplication', caSchema);

