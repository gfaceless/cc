var user = {};

module.exports = user;


user.auth = function(req, res, next) {    

    if(!req.session.isAdmin) return next('没有权限');
    next();

}