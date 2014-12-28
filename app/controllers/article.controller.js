var mongoose = require('mongoose');
var _ = require('lodash');
var async = require('async');


var Article = mongoose.model('Article');


var error = require('./err.controller.js');


exports.upsert = [function(req, res, next) {
    var article;
    
    if (req.method == 'POST') {
        // create         
        var data = {
            title: req.body.title,
            content: req.body.content,
            slug: req.body.slug
        }
        article = new Article(data)
        
        req.data = article;
        return next();
    }
    if (req.method == "PUT") {

        Article.findOne({slug: req.params.slug}, function(err, article) {
            if (err) return next(err);

            article.content = req.body.content;

            req.data = article;
            next();
        })

    }
}, function(req, res, next) {
    req.data.save(function(err, article) {
        if (err) return next(err);
        res.send({            
            success: true,
            article: article
        })
    })
}]




exports.read = function(req, res, next) {
    var slug = req.params.slug;
    Article.findOne({slug: slug}, function(err, article) {
        if (err) return next(err);
        // for front-end convenience, let's not do this:        
        /*if(!article){
            return res.send({
                success: false
            })
        }*/
        res.send({
            article: article
        })
    })
}
