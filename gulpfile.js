(function () {
  'use strict';

  var gulp = require('gulp');
  var gutil = require('gulp-util');
  var bower = require('bower');
  var sass = require('gulp-sass');
  var minifyCss = require('gulp-minify-css');
  var rename = require('gulp-rename');
  var sh = require('shelljs');
  var ngTemplates = require('gulp-ng-templates');
  var eslint = require('gulp-eslint');
  var browserify = require('browserify');
  var watchify = require('watchify');
  var _ = require('lodash');
  var source = require('vinyl-source-stream');
  var buffer = require('vinyl-buffer');
  var sourcemaps = require('gulp-sourcemaps');

  var paths = {
    sass: [
      './scss/**/*.scss',
      // './www/components/**/*.scss'
    ],
    templates: [
      './www/templates/**/*.html'
    ],
    scripts: [
      './www/**/*.js',
      '!./www/js/services/templates.min.js',
      '!./www/lib/**/*.*',
      '!./www/js/**/*.*',
      '!./www/dist/**/*.*'
    ]
  };

  gulp.task('default', ['sass', 'templates', 'lint', 'js']);

  gulp.task('sass', function (done) {
    gulp.src('./scss/ionic.app.scss')
      .pipe(sass({
        errLogToConsole: true
      }))
      .pipe(gulp.dest('./www/css/'))
      .pipe(minifyCss({
        keepSpecialComments: 0
      }))
      .pipe(rename({
        extname: '.min.css'
      }))
      .pipe(gulp.dest('./www/css/'))
      .on('end', done);
  });

  gulp.task('templates', function () {
    return gulp.src(paths.templates)
      .pipe(ngTemplates({
        path: function (path, base) {
          return path.replace(base, '/templates/');
        },
        standalone: false,
        module: 'app.services'
      }))
      .pipe(gulp.dest('./www/js/services'));
  });

  gulp.task('lint', function () {
    return gulp.src(paths.scripts)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
  });

  (function browserifyWatch() {

    // add custom browserify options here
    var customOpts = {
      entries: ['./www/js/app.js'],
      debug: true
    };
    var opts = _.assign({}, watchify.args, customOpts);
    var b = watchify(browserify(opts));

    // add transformations here
    // i.e. b.transform(coffeeify);

    function bundle() {
      return b.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({
          loadMaps: true
        })) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./www/dist'));
    }

    gulp.task('js', bundle); // so you can run `gulp js` to build the file
    b.on('update', bundle); // on any dep update, runs the bundler
    b.on('log', gutil.log); // output build logs to terminal

  }());

  gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.templates, ['templates']);
    gulp.watch(paths.scripts, ['lint']);
  });

  gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
      .on('log', function (data) {
        gutil.log('bower', gutil.colors.cyan(data.id), data.message);
      });
  });

  gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
      console.log(
        '  ' + gutil.colors.red('Git is not installed.'),
        '\n  Git, the version control system, is required to download Ionic.',
        '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
        '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
      );
      process.exit(1);
    }
    done();
  });

}());
