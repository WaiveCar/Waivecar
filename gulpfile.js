/*
 |--------------------------------------------------------------------------------
 | Gulpfile
 |--------------------------------------------------------------------------------
 */

'use strit';

// ### Dependencies

var gulp = require('gulp');

// ### Tasks
// Require all tasks defined in the ./tasks folder

require('require-dir')('tasks');

// ### Default

gulp.task('default', ['build:dist']);