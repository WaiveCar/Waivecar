/*
 |--------------------------------------------------------------------------------
 | Sass
 |--------------------------------------------------------------------------------
 */

'use strict';

// ### Dependencies

var gulp    = require('gulp');
var replace = require('gulp-replace');

// ### Tasks

gulp.task('fix:css', function () {
  return gulp
    .src('./dist/css/main.min.css')
    .pipe(replace(/\.\.\/\.\.\//g, '../'))
    .pipe(gulp.dest('./dist/css'));
});