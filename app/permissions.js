var auth = require('../lib/auth.js');

var credApplCtrl = require('./controllers/ca.controller.js');
var majorCtrl = require('./controllers/major.controller.js');
var workTypeCtrl = require('./controllers/work-type.controller.js');

auth.grant('credApplMgr', [credApplCtrl, majorCtrl, workTypeCtrl]);