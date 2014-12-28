var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    _ = require('lodash')


var articleSchema = new Schema({
	title: {type: String},
	content: {type: String},
	slug: {type: String, unique: true}
});

// maybe do some slug transfromation here

mongoose.model('Article', articleSchema);