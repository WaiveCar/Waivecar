/*
 |--------------------------------------------------------------------------------
 | Build
 |--------------------------------------------------------------------------------
 */

'use strict';

// ### Dependencies

var gulp = require('gulp');
var run  = require('run-sequence');

// ### Tasks

/**
 * @task build:quickapp
 */
gulp.task('build:quickapp', function (done) {
  run(
    'clean:sass',
    [
      'copy:common:templates',
      'sass',
      'config'
    ],
    done
  );
});

/**
 * @task build:app
 */
gulp.task('build:app', function (done) {
  run([
      'clean:sass',
      'bower'
    ],
    [
      'copy:templates',
      'sass',
      'config'
    ], done
  );
});

/**
 * @task build:dist
 */
gulp.task('build:dist', function (done) {
  run(
    'clean',
    [
      'sass',
      'config',
      'copy:common:templates',
      'copy:fonts',
      'copy:img',
      'copy:svg'
    ],
    [
      'copy:views'
    ],
    'html',
    'fix:css',
    done
  );
});