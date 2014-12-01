var user = {};

module.exports = user;


user.auth = function(req, res, next) {

    if (!req.session.isAdmin) return next('没有权限');
    next();

}

user.login = function(req, res, next) {
    var user = req.body.user;
    if (!user) return next('no user specified');
    // do User.findByName

    if (user.name == 'wang' && user.password == 'xi') {

        req.session.role = "crapMgr";
        res.send({
            success: true,
            name: "wang"
        })

        return;
    }
    if (user.name == 'wang2' && user.password == 'xi') {

        req.session.role = "crapSubmgr";
        res.send({
            success: true,
            name: "wang2"
        })

        return;
    }


    res
        .status(500)
        .send({
            message: "用户名或密码错误"
        })
}

user.logout = function(req, res, next) {
    req.session = null;
    res.send({
        success: true
    })
}

user.isLogged = function(req, res, next) {
    // tmp way:
    var logged = !!req.session.role;

    res.send({
        
        logged: logged
    })
}