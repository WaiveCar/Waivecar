/*
 |--------------------------------------------------------------------------------
 | Config
 |--------------------------------------------------------------------------------
 |
 | Generates a configuration file based on the NODE_ENV when a gulp task utilizing
 | this task is performed.
 |
 */

'use strict';

// ### Dependencies

var gulp     = require('gulp');
var template = require('gulp-template');
var rename   = require('gulp-rename');

// ### Config Task

gulp.task('config', function () {
  delete require.cache[require.resolve('config')]; // hack: reload config

  var config = require('config');
  var data = JSON.stringify(config, null, '  ').split('\n').join('\n    ');

  return gulp
    .src('app/js/services/config.js.tpl')
    .pipe(template({ data: data }))
    .pipe(rename('config.js'))
    .pipe(gulp.dest('app/js/services'));
});