var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    _ = require('lodash'),
    moment = require('moment')
  
var validator = require('validator');
validator.extend('isCNID', function (str) {
    /*very fundamental validation: */
    return /^(\d{17}[0-9xX]|\d{15})$/.test(str);
});


var required = {
  type: String, required: true, trim: true
};

var opt = {
  type: String, trim: true
};

var certificateSchema = new Schema({
    // note that idnumber tolowercase
    idnumber: _.defaults({index: true, lowercase: true/*X -> x*/}, required),

    name: _.defaults({index: true}, required),

    worktype: _.defaults({index: true}, opt),

    certlevel: _.defaults({enum: "初级 中级 高级 技师 高级技师".split(' '), index: true}, opt),

    certnumber: _.defaults({unique: true}, required),

    birth: {},

    sex: _.defaults({enum: ['男', '女']}, opt),

    edu: _.defaults({index: true}, opt),
    tscore: {type: Number, min: 0, max: 100, index: true},
    pscore: {type: Number, min: 0, max: 100, index: true},

    record: _.defaults({enum: "合格 良好 优秀".split(' ')}, opt),

    certdate: {type: Date, index: true /*makeshift*/},
    expire: {type: Date},

    danwei: opt,
    certfacility: opt,
    certcat: {type: String, default: '职业资格证书'}

}, {
    toObject : {getters: true},
    toJSON : {getters: true}
}
);

function dateGetter(val) {
    if(!val) return val;
    return moment(val).format('YYYY-MM-DD');
}

function dateSetter(val) {    
        
    if(!val) {
        return ;
        /*return this.invalidate('certdate', '颁证日期必填项');*/
    }

    var m = moment(val, ["YYYYMMDD", "YYYY-MM-DD", "MM/DD/YY", "YYYY/MM/DD"]);
    if (!m.isValid()) {
        // tmp is undefined
        var tmp = this.invalidate('certdate', '({PATH})  数据`{VALUE}`未验证通过: 不是合理的日期');
        return undefined;
    }


    var date = m.toDate();
    return date;
}

function nameSetter(name) {
    return name.replace(/\s/g, '');
}


certificateSchema.path('sex').set(function (val) {
    if(val=='1') return '男';
    if(val=='2') return '女';

    var sex = val.match(/[男|女]/);
    return sex || val;
});

//TODO: remove the following code after report is done.
function scoreSetter(val) {    
    if(typeof val == "string" && val.length ===3 && val.slice(-1) === '0') return val.slice(0, -1);
    return val;
}
certificateSchema.path('pscore').set(scoreSetter)
certificateSchema.path('tscore').set(scoreSetter)


certificateSchema.path('name').set(nameSetter);



certificateSchema.path('certdate').get(dateGetter);
certificateSchema.path('expire').get(dateGetter);


/*makeshift:*/
certificateSchema.path('certdate').set(dateSetter);
certificateSchema.path('expire').set(dateSetter);



/*certificateSchema.path('certdate').validate(function (value) {
    console.log('date for val is:', value);
    console.log(moment(value).isValid());
    return  true;
}, '不是合理的日期');*/

certificateSchema.path('idnumber').validate(function (value) {
  return  validator.isCNID(value);
}, '({PATH})  数据`{VALUE}`未验证通过: 不是合理的身份证号');




mongoose.model('Certificate', certificateSchema);