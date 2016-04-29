var gulp = require('gulp'),
	webpack = require('gulp-webpack'),
	karma = require('gulp-karma'),
	$ = require('gulp-load-plugins')(),
	config = require('./config/env.js');

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

gulp.task('build', ['demo','library'] );

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

gulp.task('serve', ['build'], function() {
	gulp.src(config.demoDir)
		.pipe($.webserver({
			port: 8000,
			host: 'localhost',
			fallback: 'index.html',
			livereload: true,
			open: true
		}))
});