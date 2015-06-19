/*
 |--------------------------------------------------------------------------------
 | Bower
 |--------------------------------------------------------------------------------
 */

'use strict';

// ### Dependencies

var gulp  = require('gulp');
var bower = require('gulp-bower');

// ### Tasks

gulp.task('bower', function() {
  return bower({
    force     : true,
    directory : './app/bower'
  });
});