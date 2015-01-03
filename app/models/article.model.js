var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    _ = require('lodash')


var articleSchema = new Schema({
	title: {type: String},
	content: {type: String},
	order: {type: Number},
	slug: {type: String, unique: true},
	hey: {type: String}
});

// maybe do some slug transfromation here

mongoose.model('Article', articleSchema);