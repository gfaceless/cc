
var fs = require('fs');
var _ = require('lodash');
var path = require('path');


var gulp = require('gulp');

var gutil = require('gulp-util');

var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var usemin = require('gulp-usemin');
var rename = require('gulp-rename');
var rev = require('gulp-rev');
var plumber = require('gulp-plumber')
var changed = require('gulp-changed');
var templateCache = require('gulp-angular-templatecache');
var del = require('del');
var livereload = require('gulp-livereload');
var gulpFilter = require('gulp-filter');


var server;


var cwd = path.resolve(process.cwd(), "../client");
process.chdir(cwd);


var config = {


	"less": {
		includes : [ "bower_components/bootstrap/less" ],
		watch : ['ca/less/*.less', 'ca/admin/less/*.less'],

		src: ["ca/less/ca.main.less","ca/admin/less/ca.admin.less"],

		// file is a vinyl instance
		// https://github.com/wearefractal/vinyl
		dest: function(file){
			return path.resolve(file.base, '../css')
		}

	}
};

var production = gutil.env.production;



var cyan = gutil.colors.cyan,
	green = gutil.colors.green,
	magenta = gutil.colors.magenta

var cwd = path.resolve(process.cwd(), '../client');


gulp.task('default', function () {
	console.log('running');
});



gulp.task('less', function () {


	// I find it more intuitively to list all those to-be-exported css files instead using glob and anti-glob
	// see config.js

	var src = config.less.src;
	var dest =  config.less.dest;

	return gulp.src(src)
		.pipe(changed(dest, {extension: '.css'}))
		// .pipe(plumber())
		.pipe(sourcemaps.init())

		.pipe(less({
			paths: config.less.includes,
			sourceMap: !production
		}))
		.on('error', gutil.log)
		.pipe(autoprefixer({
			// see http://simevidas.jsbin.com/gufoko/quiet
			// and https://github.com/ai/browserslist
			browsers: [/*'> 1%',*/'last 4 versions', 'Firefox > 20', 'Opera 12.1', 'ie 8', 'chrome >20']
		}))

		.pipe(minifyCSS())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(dest))

		// should filter .map to prevent multiple reload
		.pipe(gulpFilter(["**/*.css"]))
		.pipe(livereload())

});

gulp.task('js', function() {


	gulp.src("ca/admin/js/*.js")
		.pipe(sourcemaps.init())
			.pipe(concat('app1.js'))
		// this path is relative to the final file, not cwd
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest('ca/admin/'))

})


// now I know what plumber is
gulp.task('plumber', function() {
	gulp.src('ca/**/*.less')
		.pipe(plumber())
	  .pipe(less({paths: config.less.includes}))
	  .on('error', gutil.log)

	  .pipe(gulp.dest('ca/tmp'))
	  .on('error', gutil.log)

})

gulp.task('ca-admin-template', function() {
	// two ways to do this, the latter is easier to understand

	// FIRST:
	// i think it is a workaround
	// this gulp-angular-templateCache plugin is not well handling my problem.
	// see #https://github.com/miickel/gulp-angular-templatecache/issues/42
	// we want an abs path
	/*var base = path.resolve('ca/admin');
	return gulp.src(['ca/admin/templates/*.html', 'ca/admin/views/*.html'])
		   .pipe(templateCache({module: "myApp", base: base}))
		   .pipe(gulp.dest('ca/admin/js'));*/

    // SECOND
	return gulp.src('ca/admin/@(templates|views)/*.html')
		.pipe(templateCache({module:'myApp'}))
		.pipe(gulp.dest('ca/admin/js'))
})

gulp.task('ca-template', function() {
	// i think it is a workaround
	// this gulp-angular-templateCache plugin is not well handling my problem.
	// see #https://github.com/miickel/gulp-angular-templatecache/issues/42
	// we want an abs path
	var base = path.resolve('ca');

	return gulp.src(['ca/templates/*.html', 'ca/views/*.html'])
		   .pipe(templateCache({module: "myApp", base: base}))
		   .pipe(gulp.dest('ca/js'));
})

// I don't think usemin suits for gulp.watch (1. too slow 2. not well compatible with gulp.changed)
// and I use _index.html for now. (angularjs focuses on SPA, so just a few index.html)
gulp.task('ca-admin', ['ca-admin-template'], function () {

	// relative to cwd, which is /cc/client
	del('ca/admin/tmp', function() {
	   gulp.src(['ca/admin/_index.html'])
		  .pipe(rename('index.html'))
		  .pipe(usemin({
			// ngAnnotate should be first in case it messed up sourcemap
			js: [ngAnnotate(), sourcemaps.init(), 'concat',  uglify(), rev(), sourcemaps.write('.')],
			vendorJS: ['concat', uglify(), rev()]
			// in this case css will be only concatenated (like css: ['concat']).
		  }))
		  .pipe(gulp.dest('ca/admin'));

	})
});

gulp.task('ca', ['ca-template'], function () {

	// relative to cwd, which is /cc/client
	del('ca/tmp', function() {
	   gulp.src(['ca/_index.html'])
		  .pipe(rename('index.html'))
		  .pipe(usemin({
			// ngAnnotate should be first in case it messed up sourcemap
			js: [ngAnnotate(), sourcemaps.init(), 'concat',  uglify(), rev(), sourcemaps.write('.')],
			vendorJS: ['concat', uglify(), rev()]
			// in this case css will be only concatenated (like css: ['concat']).
		  }))
		  .pipe(gulp.dest('ca'));

	})
});



gulp.task('watch:less', function () {

	livereload.listen();

	gulp.watch(config.less.watch, ['less'])
		.on('change', onchange);

});

gulp.task('watch', ["watch:less"]);

gulp.task('all', ["ca", "ca-admin", "less"]);

function onchange(e) {
	gutil.log(gutil.colors.cyan(path.basename(e.path)), 'was', e.type, gutil.colors.green('running task..'));
	/* not good: could have loaded files before they are processed,
		and subject to partial construct thingy too. (less, browserify: change of imported files) */
	// server.changed(e.path);
}

