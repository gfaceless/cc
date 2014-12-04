var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    _ = require('lodash')

var crypto = require('crypto');

var userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    // we could also name it "userGroup"
    // should be a reference, for now let's make it string
    role: {
        type: String,
        required: true,
        trim: true,
        default: function() {
            return "crapSubmgr"
        }
    }
});


userSchema.path('name').validate(function(value) {
    // makeshift:
    return value != 'sys'
}, '此为高级管理员帐号，添加不能');

userSchema.path('password').set(function(val) {
    // makeshift
    // what about being empty?    
    // here `this` is a document
    return this.model('User').hashPass(val);
})

userSchema.static('hashPass', function(pass) {
    return crypto
        .createHash('sha256')
        .update(pass, 'utf8')
        .digest('base64');
})

mongoose.model('User', userSchema);
