var mongoose = require('mongoose');

var dbMap = require('../app/models/certificate/db-map.js');

mongoose.Error.prototype.formatMessage = function(msg, path, type, val) {
    if (!msg) throw new TypeError('message is required');

    return msg.replace(/{PATH}/g, dbMap[path] ? dbMap[path] : path)
        .replace(/{VALUE}/, String(val || ''))
        .replace(/{TYPE}/, type || 'declared type');
}

var msg = mongoose.Error.messages;
msg.String.enum = "({PATH})  数据`{VALUE}`未验证通过: 不是合理的{PATH}";
msg.general.default = "({PATH})  数据`{VALUE}`未验证通过";
msg.general.required = "({PATH})  `{PATH}`是必填的";


msg.Number.min = "({PATH})  数据`{VALUE}`未验证通过：小于最小允许值 ({MIN}).";
msg.Number.max = "({PATH})  数据`{VALUE}`未验证通过：大于最大允许值 ({MAX}).";
