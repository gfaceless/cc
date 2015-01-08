// ca means `credit application`

var express = require('express');
var router = express.Router();
var certController = require('../controllers/cert.controller.js');
var userCtrl = require('../controllers/user.controller.js');
var majorCtrl = require('../controllers/major.controller.js');
var caCtrl = require('../controllers/ca.controller.js');
var workTypeCtrl = require('../controllers/work-type.controller.js');
var articleCtrl = require('../controllers/article.controller.js');


var _ = require('lodash');

var perm = require('../permissions.js');

module.exports = router;


router.post('/credit-apply', caCtrl.creditApply);
router.get('/major', majorCtrl.list);
router.get('/articles/:slug', articleCtrl.read);
router.get('/articles-meta', articleCtrl.getMetadata);


var adminRouter = express.Router();


router.use('/admin', adminRouter);

var noSub = perm.allow('crapMgr');
var allMgr = perm.allow(['crapMgr', 'crapSubMgr']);


adminRouter.get('/ca-results', allMgr, caCtrl.list);
adminRouter.get('/ca-results/to-excel', allMgr, caCtrl.toExcel);

adminRouter.delete('/ca-results/:id?', noSub, caCtrl.remove);


adminRouter.post('/major', noSub, majorCtrl.create);

// :delAppl delete applicants
adminRouter.delete('/major/:id/:delAppl?', noSub, majorCtrl.remove);
adminRouter.put('/major/:id', noSub, majorCtrl.update);


adminRouter.get('/work-types', allMgr, workTypeCtrl.list);
adminRouter.post('/work-type', noSub, workTypeCtrl.create);
// actually it is an deletion, I'll find a better way
adminRouter.post('/work-type/delete', noSub, workTypeCtrl.removeFromMajor);
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


// articles:

adminRouter.post('/articles', noSub, articleCtrl.upsert)
adminRouter.put('/articles/:slug', noSub, articleCtrl.upsert)

// note that we also allow public access for GET request, see above
adminRouter.get('/articles/:slug', articleCtrl.read);



// tmp:
adminRouter.get('/test/try2', function(req, res, next) {
		res.redirect('test5.html');
})