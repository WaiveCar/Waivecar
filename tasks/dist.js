/*
 |--------------------------------------------------------------------------------
 | Dist
 |--------------------------------------------------------------------------------
 */

'use strict';

// ### Dependencies

var express = require('express');
var path    = require('path');
var gulp    = require('gulp');
var util    = require('gulp-util');

// ### Tasks

gulp.task('dist', ['build:dist'], function (done) {
  var PORT = process.env.PORT || 3081;
  var BASE = process.env.BASE || '/';
  var DIR = './dist';

  express()
    .use(BASE, express.static(path.join(__dirname, '../', DIR), { etag: false }))
    .listen(PORT, function () {
      util.log('Express server listening at http://localhost:' + PORT + BASE);
      done();
    });
});