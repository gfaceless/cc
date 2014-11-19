var express = require('express');
var router = express.Router();
var certController = require('../controllers/cert.controller.js');
var userController = require('../controllers/user.controller.js');
var _ = require('lodash');

module.exports = router;

var urlParser = require('../middlewares/url-parser.js');



router.all('/*', require('cookie-parser')(), function(req, res, next) {
	console.log('the cookie is: ', req.cookies);
	next();
})

var auth = userController.auth



router.post('/', auth, certController.create);
router.get('/', auth, urlParser, certController.read);
router.put('/:id', auth, certController.update);
router.delete('/:id', auth, certController.delete)

router.post('/upload', auth, certController.upload)
router.get('/export', auth, urlParser, certController.export)
router.get('/download/:fileName', auth, certController.download)

// public access:
router.get('/p', urlParser, certController.prePublicSearch, certController.read);

// router.get('/csv', certController.csv);



router.get('/rns', certController.removeNameSpace);



/* debris: in case I need it*/
/*router.param('id', function(req, res, next, id) {
    if (/\d+/.test(id)) id = Number(id);
    next();

});*/






