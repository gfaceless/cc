var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    _ = require('lodash')



var workTypeSchema = new Schema({
	name: {type: String, required: true, trim: true}
});



mongoose.model('WorkType', workTypeSchema);