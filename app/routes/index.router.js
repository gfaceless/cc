/*
 *  remember that we had put static resources in later order of the middleware stack,
 *  so take caution when specify routers like /:thing/:id, would overwrite static res
*/
var express = require('express');
var router = express.Router();

var fs = require('fs')
var urlParser = require('../middlewares/url-parser.js');
var _ = require('lodash');

router.get('/', function(req, res, next) {


    res.redirect('app.html');
});


// temp:
router.post('/admin9', /*urlParser,*/ function(req, res, next) {
    var user = req.body.user;
    if (!_.isObject(user)) return next('登录错误'); // actually it maybe a possible attack
    if (user.name === 'admin' && user.password === '123456') {
    	req.session.isAdmin = true;
        return res.send({
            success: true,
            logged: true
        })
    }
    res.send({
    	success: false
    })
})

router.post('/admin9/isLogged', function(req, res,next) {

    res.send({
        isLogged: req.session.isAdmin || false
    })

})

router.post('/admin9/logout', function(req, res, next) {
    if(req.session.isAdmin){
        delete req.session.isAdmin;
        res.send({
            success: true
        })
    } else {
        res.send({success: false});
    }
})

module.exports = router;
