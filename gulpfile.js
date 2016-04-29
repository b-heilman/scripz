var $ = require('gulp-load-plugins')(),
	gulp = require('gulp'),
	map = require('map-stream'),
	webpack = require('gulp-webpack'),
	karma = require('gulp-karma'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish');


var config = require('./config/env.js');

gulp.task('demo', function() {
	return gulp.src(config.jsSrc)
		.pipe(webpack({
			entry: './'+config.demoConfig,
			module: {
				loaders: [{
					test: /\.js$/,
					loader: "babel-loader",
					query: {
    				presets: ['es2015']
  				}
				}],
			},
			output: {
				filename: 'demo.js'
			}
		}))
		.pipe(gulp.dest(config.demoDir));
});

gulp.task('library', function() {
	return gulp.src(config.jsDemo)
		.pipe(webpack({
			entry: './'+config.libraryConfig,
			module: {
				loaders: [{
					test: /\.js$/,
					loader: "babel-loader",
					query: {
    				presets: ['es2015']
  				}
				}],
			},
			output: {
				filename: 'Scripz.js',
				library: "Scripz",
				libraryTarget: "var"
			},
			externals: {
				"es6-promise": "ES6Promise"
			}
		}))
		.pipe(gulp.dest(config.distDir));
});

gulp.task('test', ['build'], function() {
	return gulp.src('aaa')
			.pipe(karma({
					configFile: './karma.conf.js',
					action: 'run'
			}))
			.on('error', function(err) {
					throw err;
			});
});

var failOnError = function() {
    return map(function(file, cb) {
        if (!file.jshint.success) {
            process.exit(1);
        }
        cb(null, file);
    });
};

gulp.task('build-lint', function() {
    gulp.src( config.jsSrc )
        .pipe( jshint() )
        .pipe( jshint.reporter(stylish) )
        .pipe( failOnError() );
});

gulp.task('lint', function() {
    gulp.src( config.jsSrc )
        .pipe( jshint() )
        .pipe( jshint.reporter(stylish) );
});

gulp.task('build', ['build-lint', 'demo','library'] );

gulp.task('watch', ['build'], function(){
	gulp.watch(config.jsSrc, ['lint', 'demo','library']);
});

gulp.task('serve', ['watch'], function() {
	gulp.src(config.demoDir)
		.pipe($.webserver({
			port: 8000,
			host: 'localhost',
			fallback: 'index.html',
			livereload: true,
			open: true
		}))
});