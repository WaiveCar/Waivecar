var gulp = require('gulp');
var run = require('run-sequence');
var plugins = require('gulp-load-plugins')();
var express = require('express');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var bower = require('gulp-bower');

var scripts = [
  './app/**/*.js',
  '!./app/bower/**/*.js',
  './*.js'
];

gulp.task('jshint', function() {
  return gulp
    .src(scripts)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('bower', function() {
  return bower({
    force: true,
    directory: './app/bower'
  });
});

gulp.task('clean:dist', function () {
  return gulp.src('dist')
    .pipe(plugins.clean({ force: true }));
});

gulp.task('clean:sass', function () {
  return gulp.src([
    'app/css/**/*.css*'
  ]).pipe(plugins.clean());
});

gulp.task('clean', function (done) {
  run(['clean:dist', 'clean:sass'], done);
});

gulp.task('clean:bower', function () {
  return gulp.src('app/bower')
    .pipe(plugins.clean());
});

gulp.task('clean:npm', function () {
  return gulp.src('node_modules')
    .pipe(plugins.clean());
});

gulp.task('clean:deps', function (done) {
  run(['clean:bower', 'clean:npm'], done);
});

gulp.task('copy:img', function () {
  return gulp.src(['app/img/**/*', '!app/img/**/*.svg'])
    .pipe(plugins.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('copy:fonts', function () {
  return gulp.src([
    'app/fonts/**.*',
    'app/bower/font-awesome/fonts/**.*'
  ]).pipe(gulp.dest('./dist/fonts'));
});

gulp.task('copy:svg', function () {
  return gulp.src('app/img/**/*.svg')
    .pipe(gulp.dest('dist/img'));
});

gulp.task('sass', function () {
  return gulp.src([
    'app/css/main.scss',
  ], { base: 'app' })
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      onError: function(err) {
        plugins.util.log('sass error', err);
        plugins.util.beep();
      }
    }))
    .pipe(plugins.sourcemaps.write())
    .pipe(plugins.if('*.css', plugins.autoprefixer('last 2 version')))
    .pipe(gulp.dest('app'));
});

gulp.task('config', function () {
  // hack: reload config
  delete require.cache[require.resolve('config')];
  var config = require('config');
  var data = JSON.stringify(config, null, '  ').split('\n').join('\n    ');

  return gulp.src('app/services/config.js.tpl')
    .pipe(plugins.template({ data: data }))
    .pipe(plugins.rename('config.js'))
    .pipe(gulp.dest('app/services'));
});

gulp.task('html', function () {
  var assets = plugins.useref.assets();

  return gulp.src('app/index.html')
    .pipe(assets)
    .pipe(plugins.if('*.js', plugins.ngAnnotate()))
    .pipe(plugins.if('*.js', plugins.uglify()))
    .pipe(plugins.if('*.css', plugins.minifyCss( { keepSpecialComments: 0, keepBreaks: true })))
    .pipe(plugins.if('*.html', plugins.minifyHtml( { conditionals: true, quotes: true })))
    .pipe(assets.restore())
    .pipe(plugins.useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('fix:css', function () {
  return gulp.src('dist/css/main.min.css')
    .pipe(plugins.replace(/\.\.\/\.\.\//g, '../'))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('copy:views', function () {
  return gulp.src([
    'app/templates/**/*.html'
  ], { base: 'app' }).pipe(gulp.dest('dist'));
});

gulp.task('copy:bower', function () {
  return gulp.src('app/bower/**')
    .pipe(gulp.dest('dist/bower'));
});

// gulp.task('copy:template', function () {
//   return gulp.src('app/templates/**')
//     .pipe(gulp.dest('dist/templates'));
// });

gulp.task('app', ['build:quickapp'], function (done) {
  gulp.watch('app/css/**/*.scss', ['sass']);
  gulp.watch('app/services/config.js.tpl', ['config']);
  gulp.watch('config/*', ['config']);

  plugins.livereload({ start: true });

  gulp.watch([
    'app/**/*',
    '!app/bower/**',
    '!app/css/**/*.css.map',
    '!app/css/**/*.scss',
  ]).on('change', function (file) {
    plugins.livereload.changed(file.path);
  });

  var PORT = process.env.PORT || 3081;
  var BASE = process.env.BASE || '/';
  var DIR = '/app';

  var server = express().use(BASE, express.static(__dirname + DIR, { etag: false }));

  server.listen(PORT, function () {
    plugins.util.log('Express server listening at http://localhost:' + PORT + BASE);
    done();
  });
});

gulp.task('dist', ['build:dist'], function (done) {
  var PORT = process.env.PORT || 3081;
  var BASE = process.env.BASE || '/';
  var DIR = '/dist';

  express()
    .use(BASE, express.static(__dirname + DIR, { etag: false }))
    .listen(PORT, function () {
      plugins.util.log('Express server listening at http://localhost:' + PORT + BASE);
      done();
    });
});

gulp.task('build:quickapp', function (done) {
  run('clean:sass', [ 'sass', 'config' ], done);
});

gulp.task('build:app', function (done) {
  run([ 'clean:sass', 'bower' ], [ 'sass', 'config' ], done);
});

gulp.task('build:dist', function (done) {
  run(
    'clean',
    ['copy:views', 'sass', 'config', 'copy:fonts', 'copy:img', 'copy:svg'],
    'html',
    'fix:css',
    done
  );
});


gulp.task('default', ['build:dist']);