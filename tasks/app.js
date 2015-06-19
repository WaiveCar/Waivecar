/*
 |--------------------------------------------------------------------------------
 | App
 |--------------------------------------------------------------------------------
 */

'use strict';

// ### Dependencies

var express    = require('express');
var path       = require('path');
var gulp       = require('gulp');
var livereload = require('gulp-livereload');
var util       = require('gulp-util');
var config     = require('./config');

// ### Tasks

gulp.task('app', ['build:quickapp'], function (done) {
  gulp.watch('app/css/**/*.scss', ['sass']);
  gulp.watch('app/js/services/config.js.tpl', [ 'config' ]);
  gulp.watch('config/*', ['config']);

  livereload({ start: true });

  gulp.watch([
    'app/**/*',
    '!app/bower/**',
    '!app/css/**/*.css.map',
    '!app/css/**/*.scss',
  ]).on('change', function (file) {
    livereload.changed(file.path);
  });

  var PORT = process.env.PORT || 3081;
  var BASE = process.env.BASE || '/';
  var DIR = 'app';

  var server = express().use(BASE, express.static(path.join(__dirname, '../', DIR), { etag: false }));

  server.listen(PORT, function () {
    util.log('Express server listening at http://localhost:' + PORT + BASE);
    done();
  });
});