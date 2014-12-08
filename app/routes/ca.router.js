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
adminRouter.get('/ca-results/to-excel', allMgr, caCtrl.toExcel);

adminRouter.delete('/ca-results/:id', noSub, caCtrl.remove);


adminRouter.post('/major', noSub, majorCtrl.create);
adminRouter.post('/major/:id', noSub, majorCtrl.remove);
adminRouter.put('/major/:id', noSub, majorCtrl.update);


adminRouter.get('/work-types', allMgr, workTypeCtrl.list);
adminRouter.post('/work-type', noSub, workTypeCtrl.create);
// actually it is an deletion, I'll find a better way
adminRouter.post('/work-type/:id', noSub, workTypeCtrl.removeFromMajor);
adminRouter.put('/work-type/:id', noSub, workTypeCtrl.update);

// actually now it is the same as the one students can access.
adminRouter.get('/majors', allMgr, majorCtrl.list);


adminRouter.post('/login', userCtrl.login);
adminRouter.post('/logout', userCtrl.logout);
adminRouter.post('/isLogged', userCtrl.isLogged);



// user:
adminRouter.get('/users', noSub, userCtrl.list);
adminRouter.post('/users', noSub, userCtrl.create);
adminRouter.put('/users/:id', noSub, userCtrl.update);
adminRouter.delete('/users/:id', noSub, userCtrl.remove);




