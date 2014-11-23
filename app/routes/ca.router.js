// ca means `credit application`

var express = require('express');
var router = express.Router();
var certController = require('../controllers/cert.controller.js');
var userController = require('../controllers/user.controller.js');
var majorCtrl = require('../controllers/major.controller.js');
var caCtrl = require('../controllers/ca.controller.js');
var workTypeCtrl = require('../controllers/work-type.controller.js');

var _ = require('lodash');

module.exports = router;

router.post('/credit-apply', caCtrl.creditApply);


router.post('/admin/major', majorCtrl.create);
router.put('/admin/major/:id', majorCtrl.update);


router.post('/admin/work-type', workTypeCtrl.create);
// actually it is an deletion, I'll find a better way
router.post('/admin/work-type/:id', workTypeCtrl.removeFromMajor);
router.put('/admin/work-type/:id', workTypeCtrl.update);


router.get('/admin/major', majorCtrl.list);
router.get('/major', majorCtrl.list);

router.get('/work-type', workTypeCtrl.list);


// test:

