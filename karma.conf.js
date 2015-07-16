// Karma configuration
// Generated on Tue May 19 2015 20:38:49 GMT-0300 (BRT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    files: [
      './www/lib/angular/angular.js',
      './www/lib/angular-animate/angular-animate.js',
      './www/lib/angular-sanitize/angular-sanitize.js',
      './www/lib/angular-resource/angular-resource.js',
      './www/lib/angular-mocks/angular-mocks.js',
      './www/lib/angular-ui-router/release/angular-ui-router.js',
      './www/lib/ionic/js/ionic.min.js',
      './www/lib/ionic/js/ionic-angular.min.js',
      './www/lib/ngCordova/dist/ng-cordova.min.js',
      './www/app.js',
      './www/services/*.js',
      './www/modules/**/*.js',
      './www/components/**/*.js',
      // './tests/**/*Spec.js'
      './tests/fiddle.js'
    ],
    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
