/*
 |--------------------------------------------------------------------------------
 | Clean
 |--------------------------------------------------------------------------------
 |
 | Collection of gulp tasks to clean up project folders.
 |
 */

'use strict';

// ### Dependencies

var gulp  = require('gulp');
var clean = require('gulp-clean');
var run   = require('run-sequence');

// ### Tasks

/**
 * Runs the dist and sass clean tasks.
 * @task clean
 */
gulp.task('clean', function (done) {
  run(['clean:dist', 'clean:sass'], done);
});

/**
 * Removes the bower and node_module dependencies
 * @task clean:deps
 */
gulp.task('clean:deps', function (done) {
  run(['clean:bower', 'clean:npm'], done);
});

/**
 * Forcefully remove the dist folder from the project root
 * @task clean:dist
 */
gulp.task('clean:dist', function () {
  return gulp.src('dist').pipe(clean({
    force : true
  }));
});

/**
 * Remove all css related files inside of the app folder
 * @task clean:sass
 */
gulp.task('clean:sass', function () {
  return gulp.src([
    'app/css/**/*.css*'
  ])
  .pipe(clean());
});

/**
 * Remove the bower folder in ./app
 * @task clean:bower
 */
gulp.task('clean:bower', function () {
  return gulp.src('app/bower').pipe(clean());
});

/**
 * Remove the node_module folder from the project root
 */
gulp.task('clean:npm', function () {
  return gulp.src('node_modules').pipe(clean());
});