/*
 *  remember that we had put static resources in later order of the middleware stack,
 *  so take caution when specify routers like /:thing/:id, would overwrite static res
*/
var express = require('express');
var router = express.Router();

var fs = require('fs')
var urlParser = require('../middlewares/url-parser.js');
var _ = require('lodash');

var userCtrl = require('../controllers/user.controller.js');
var perm = require('../permissions.js');


router.get('/', function(req, res, next) {

    res.redirect('app.html');
});


// temp:
router.post('/admin9', /*urlParser,*/ userCtrl.login)
router.post('/admin9/logout', userCtrl.logout)

router.post('/admin9/isLogged', function(req, res,next) {

    res.send({
        isLogged: req.session.role == 'admin'
    })

})


var onlyAdmin = perm.allow('admin');

router.post('/admin-root', userCtrl.noAdmin, userCtrl.create("admin"))
router.post('/admin10', onlyAdmin, userCtrl.create('admin'));

// NOTE: onlyAdmin should be `onlySelf`, this is a hole
router.put('/admin10/', onlyAdmin, userCtrl.updateSelf);
// adminRouter.delete('/users/:id', noSub, userCtrl.remove);

module.exports = router;
