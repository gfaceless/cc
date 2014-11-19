var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    _ = require('lodash')


var majorSchema = new Schema({

	name: {type: String, required: true, trim: true},

	workTypes: [{ type: Schema.Types.ObjectId, ref: 'WorkType' }]
});



mongoose.model('Major', majorSchema);