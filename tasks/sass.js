/*
 |--------------------------------------------------------------------------------
 | Sass
 |--------------------------------------------------------------------------------
 */

'use strict';

// ### Dependencies

var gulp         = require('gulp');
var sourcemaps   = require('gulp-sourcemaps');
var sass         = require('gulp-sass');
var util         = require('gulp-util');
var autoprefixer = require('gulp-autoprefixer');
var gulpIf       = require('gulp-if');

// ### Tasks

/**
 * Compiles sass to css
 * @task sass
 */
gulp.task('sass', function () {
  return gulp.src([
    'app/css/main.scss',
  ], {
    base: 'app'
  })
  .pipe(sourcemaps.init())
  .pipe(sass({
    onError: function(err) {
      util.log('sass error', err);
      util.beep();
    }
  }))
  .pipe(sourcemaps.write())
  .pipe(gulpIf('*.css', autoprefixer('last 2 version')))
  .pipe(gulp.dest('app'));
});