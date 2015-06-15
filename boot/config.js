/*jshint camelcase: false */
var path = require('path');
var parentDir = path.join(__dirname, '..');
var appDir = path.join(parentDir, 'app');
var pkg = require(path.join(parentDir, 'package'));
var assetsDir = path.join(parentDir,'assets');
var publicDir = path.join(assetsDir, 'public');
var templatesDir = path.join(assetsDir, 'emails');
var viewsDir = path.join(appDir, 'views');
var maxAge = 24 * 60 * 60 * 1000;

exports = module.exports = function() {

  return {

    defaults: {
      app: {
        name: 'api'
      },
      cleanOnRestart: false,
      allowCleanup: true,
      auth: {
        tokenSecret: 'api-app-secret'
      },
      admin: {
        email: 'admin@example.com',
        password: 'lollipop0',
        firstName: 'Site',
        lastName: 'Administrator'
      },
      basicAuth: {
        enabled: false,
        name: 'admin',
        pass: 'password'
      },
      facebook: {
        enabled: false,
        appID: '',
        appSecret: '',
        scope: [ 'email' ]
      },
      google: {
        enabled: false,
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        clientID: '',
        clientSecret: ''
      },
      pkg: pkg,
      cache: false,
      showStack: true,
      assetsDir: assetsDir,
      publicDir: publicDir,
      views: {
        dir: viewsDir,
        engine: 'jade'
      },
      password: {
        minStrength: 0,
        limitAttempts: false
      },
      email: {
        templates: {
          dir: templatesDir
        },
        sender: 'matt.ginty@gmail.com',
        transport: {
          service: 'mandrill',
          port: 2525,
          auth: {
            user: 'matt.ginty@gmail.com',
            pass: 'atA-wM7O5PXJn7hg38e4kA'
          }
        }
      },
      session: {
        secret: 'igloo-change-me',
        key: 'igloo',
        cookie: {
          maxAge: maxAge
        },
        resave: true,
        saveUninitialized: true
      },
      trustProxy: true,
      updateNotifier: {
        enabled: true,
        dependencies: {},
        updateCheckInterval: 1000 * 60 * 60,
        updateCheckTimeout: 1000 * 20
      },
      staticServer: {
        maxAge: maxAge
      },
      server: {
        host: 'localhost',
        cluster: false,
        ssl: {
          enabled: false,
          options: {}
        }
      },
      cookieParser: 'igloo-change-me',
      csrf: {
        enabled: false,
        options: {
          cookie: {
            maxAge: maxAge
          }
        }
      },
      vehiclesService:{
        api:{
          key:'l7xx4b8664dc303546798628cd60ed052ac6',
          secret:'7ae244bc215e4f80988cc2184d2f552c',
        },
        host:'https://developer.gm.com/api/v1/'
      },
      origins: {
        whitelist: ['*'],
        // sets the req.origin based on matched origins list
        // { 'http://localhost:3081' : 'admin' }
        list: {}
      },
      mongo: {
        host: 'localhost',
        port: 27017,
        opts: {},
        // faster - don't perform 2nd request to verify
        // log message was received/saved
        safe: false
      },
      knex: {
        client: 'mysql'
      },
      redis: {
        host: 'localhost',
        port: 6379,
        maxAge: maxAge
      },
      output: {
        handleExceptions: false,
        colorize: true,
        prettyPrint: false
      },
      logger: {
        'console': true,
        requests: true,
        mongo: false,
        file: false,
        hipchat: false,
        slack: false
      },
      less: {
        path: publicDir,
        options: {
          force: true
        }
      },
      jade: {
        amd: {
          path: '/js/tmpl/',
          options: {}
        }
      },
      jobs: {
        removeCompleted: false,
        // Flag to skip processing jobs in environments matching.
        // e.g. Add [ 'development' ] to it one day.
        skipProcessingIn: [ ],
        kue: {
          port: 3001,
          prefix: 'q',
          redis: {
            port: 6379,
            host: '127.0.0.1'
          }
        }
      },
      s3: {
        bucket: '',
        key: '',
        secret: ''
      },
      twilio: {
        sid: 'AC5bdaac9e2ad39755f9565c7e9d75dab4',
        token: '6134bfa803b73155fe0cf13b506798ee',
        number: '+16692440099',
        message: 'api'
      }
    },

    test: {
      url: 'http://localhost:5000',
      server: {
        env: 'test',
        port: 5000
      },
      mongo: {
        dbname: 'igloo-test',
        db: 'igloo-test' // keep for winston logger
      },
      redis: {
        prefix: 'igloo_test'
      },
      logger: {
        'console': false,
        requests: false
      },
      twilio: {
        number: '+15005550006'
      }
    },

    development: {
      cache: true,
      url: 'http://localhost:3000',
      server: {
        env: 'development',
        port: 3000,
      },
      mongo: {
        dbname: 'igloo-development',
        db: 'igloo-development' // keep for winston logger
      },
      knex: {
        debug: true,
        connection: {
          host: '127.0.0.1',
          user: 'root',
          password: '',
          database: 'igloo_development'
        }
      },
      redis: {
        prefix: 'igloo-development'
      }
    },

    production: {
      cache: true,
      url: 'http://localhost:3080',
      password: {
        minStrength: 1,
        limitAttempts: true
      },
      views: {
        dir: path.join(assetsDir, 'dist'),
      },
      publicDir: path.join(assetsDir, 'dist'),
      showStack: false,
      updateNotifier: {
        enabled: false,
      },
      server: {
        env: 'production',
        port: 3080,
        cluster: true
      },
      mongo: {
        dbname: 'igloo-production',
        db: 'igloo-production' // keep for winston logger
      },
      knex: {
        connection: {
          host: '127.0.0.1',
          user: 'root',
          password: '',
          database: 'igloo_production'
        }
      },
      redis: {
        prefix: 'igloo_production'
      },
      output: {
        colorize: false
      },
      logger: {
        'console': true,
        requests: true,
        mongo: false,
        file: false
        /*
        // <https://github.com/flatiron/winston#file-transport>
        file: {
          filename: '/var/log/igloo.log',
          // TODO: maxsize
          // TODO: maxFiles
          timestamp: true
        }
        */
      }
    }

  };

};

exports['@singleton'] = true;
