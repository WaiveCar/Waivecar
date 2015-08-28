var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var ngTemplates = require('gulp-ng-templates');
var eslint = require('gulp-eslint');

var paths = {
  sass: [
    './scss/**/*.scss',
    './www/components/**/*.scss'
  ],
  templates: [
    './www/templates/**/*.html'
  ],
  scripts: [
    './www/**/*.js',
    '!./www/js/services/templates.min.js',
    '!./www/lib/**/*.*',
    '!./www/js/**/*.*'
  ]
};

gulp.task('default', [ 'sass', 'templates', 'lint' ]);

gulp.task('lint', function () {
  return gulp.src(paths.scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('templates', function () {
  return gulp.src(paths.templates)
    .pipe(ngTemplates({
      path: function(path, base) {
        return path.replace(base, '/templates/');
      },
      standalone: false,
      module: 'app.services'
    }))
    .pipe(gulp.dest('./www/js/services'));
});

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, [ 'sass' ]);
  gulp.watch(paths.templates, [ 'templates' ]);
  gulp.watch(paths.scripts, [ 'lint' ]);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
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
