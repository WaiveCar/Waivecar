/*
 |--------------------------------------------------------------------------------
 | Copy
 |--------------------------------------------------------------------------------
 |
 | Collection of gulp tasks to copy project files
 |
 */

'use strict';

// ### Dependencies

var gulp     = require('gulp');
var imagemin = require('gulp-imagemin');

// ### Tasks

/**
 * Copies all the image assets from ./app to ./dist
 * @task copy:img
 */
gulp.task('copy:img', function () {
  return gulp
    .src([
      './app/img/**/*',
      '!./app/img/**/*.svg'
    ])
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('./dist/img'));
});

/**
 * Copies all the font assets from ./app to ./dist
 * @task copy:fonts
 */
gulp.task('copy:fonts', function () {
  return gulp
    .src([
      './app/fonts/**.*',
      './app/bower/font-awesome/fonts/**.*'
    ])
    .pipe(gulp.dest('./dist/fonts'));
});

/**
 * Copies all the svg assets from ./app to ./dist
 * @task copy:svg
 */
gulp.task('copy:svg', function () {
  return gulp
    .src('./app/img/**/*.svg')
    .pipe(gulp.dest('./dist/img'));
});

/**
 * Copies all ./app/templates to ./dist
 * @task copy:views
 */
gulp.task('copy:views', function () {
  return gulp
    .src('./app/templates/**/*.html', { base: './app' })
    .pipe(gulp.dest('./dist'));
});

/**
 * Copies all ./app/bower to ./dist/bower
 * @task copy:bower
 */
gulp.task('copy:bower', function () {
  return gulp
    .src('./app/bower/**')
    .pipe(gulp.dest('./dist/bower'));
});

/**
 * Copies all the ./app/templates to ./dist/templates
 * @task copy:template
 */
gulp.task('copy:templates', function () {
  return gulp
    .src('./app/templates/**')
    .pipe(gulp.dest('./dist/templates'));
});

/**
 * Copies all the common-module templates from ./bower to ./app
 * @task copy:templates
 */
gulp.task('copy:common:templates', function() {
  return gulp
    .src('./app/bower/common-modules/src/templates/**/*.html')
    .pipe(gulp.dest('./app/templates'));
});