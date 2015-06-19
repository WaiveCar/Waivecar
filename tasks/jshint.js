/*
 |--------------------------------------------------------------------------------
 | JSHint
 |--------------------------------------------------------------------------------
 */

'use strict';

// ### Dependencies

var gulp    = require('gulp');
var jshint  = require('gulp-jshint');
var stylish = require('jshint-stylish');

// ### Tasks

gulp.task('jshint', function() {
  return gulp
    .src([
      './app/**/*.js',
      '!./app/bower/**/*.js',
      './*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});