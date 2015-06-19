/*
 |--------------------------------------------------------------------------------
 | HTML
 |--------------------------------------------------------------------------------
 */

'use strict';

// ### Dependencies

var gulp       = require('gulp');
var ngAnnotate = require('gulp-ng-annotate');
var uglify     = require('gulp-uglify');
var minifyCss  = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var gulpIf     = require('gulp-if');
var useref     = require('gulp-useref');

// ### Tasks

gulp.task('html', function () {
  var assets = useref.assets();

  return gulp
    .src('./app/index.html')
    .pipe(assets)
    .pipe(gulpIf('*.js', ngAnnotate()))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', minifyCss( { keepSpecialComments: 0, keepBreaks: true })))
    .pipe(gulpIf('*.html', minifyHtml( { conditionals: true, quotes: true })))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('./dist'));
});