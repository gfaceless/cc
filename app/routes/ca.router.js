// ca means `credit application`

var express = require('express');
var router = express.Router();
var certController = require('../controllers/cert.controller.js');
var userCtrl = require('../controllers/user.controller.js');
var majorCtrl = require('../controllers/major.controller.js');
var caCtrl = require('../controllers/ca.controller.js');
var workTypeCtrl = require('../controllers/work-type.controller.js');


var _ = require('lodash');

var perm = require('../permissions.js');

module.exports = router;


router.post('/credit-apply', caCtrl.creditApply);
router.get('/major', majorCtrl.list);


var adminRouter = express.Router();


router.use('/admin', adminRouter);

var noSub = perm.allow('crapMgr');
var allMgr = perm.allow(['crapMgr', 'crapSubmgr']);


adminRouter.get('/ca-results', allMgr, caCtrl.list);


adminRouter.post('/major', noSub, majorCtrl.create);
adminRouter.post('/major/:id', noSub, majorCtrl.remove);
adminRouter.put('/major/:id', noSub, majorCtrl.update);


adminRouter.post('/work-type', noSub, workTypeCtrl.create);
// actually it is an deletion, I'll find a better way
adminRouter.post('/work-type/:id', noSub, workTypeCtrl.removeFromMajor);
adminRouter.put('/work-type/:id', noSub, workTypeCtrl.update);


adminRouter.get('/major', allMgr, majorCtrl.list);


adminRouter.post('/login', userCtrl.login);
adminRouter.post('/logout', userCtrl.logout);
adminRouter.post('/isLogged', userCtrl.isLogged);

