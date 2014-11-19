var fs = require('fs');
var _ = require('lodash');
var path = require('path');


var gulp = require('gulp');
var gutil = require('gulp-util');

var less = require('gulp-less');


var server;


var config = {
    
   
    "less": {
        includes : [ "../client/bower_components/bootstrap/less" ],
        watch : ['../client/ca/less/*.less', '../client/ca/admin/less/*.less'],
        
        // maybe I should put them together
        targets: [
            {src: "../client/ca/less/ca.main.less", dest: '../client/ca/css'},
            {src: "../client/ca/admin/less/ca.admin.less", dest: '../client/ca/admin/css'}
        ]
    }
};

var production = gutil.env.production;



var cyan = gutil.colors.cyan,
    green = gutil.colors.green,
    magenta = gutil.colors.magenta



gulp.task('default', function () {
    console.log('running');
});



gulp.task('less', function () {
    

    // I find it more intuitively to list all those to-be-exported css files instead using glob and anti-glob
    // see config.js
    _.each(config.less.targets, function (target) {

        target.dest = target.dest || path.join( path.dirname(src), '../', 'css');

        gulp.src(target.src)
            .pipe(less({
                paths: config.less.includes,
                sourceMap: !production
            }))
            .on('error', gutil.log)
            .pipe(gulp.dest(
                target.dest
            ))
    });


    /*if (server) {
        stream.pipe(livereload())
        gutil.log(green('live reloading...'));
    }*/
});




gulp.task('watch:less', function () {
    gulp.watch(config.less.watch, ['less'])
        .on('change', onchange);

});

gulp.task('watch', ["watch:less"/*, "livereload"*/]);


function onchange(e) {
    gutil.log(gutil.colors.cyan(path.basename(e.path)), 'was', e.type, gutil.colors.green('running task..'));
    /* not good: could have loaded files before they are processed,
        and subject to partial construct thingy too. (less, browserify: change of imported files) */
    // server.changed(e.path);
}

