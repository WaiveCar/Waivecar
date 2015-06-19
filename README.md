# Waivecar - API

[![Build Status](https://magnum.travis-ci.com/clevertech/Waivecar.svg?token=EMVjzHuEYHd2d2DHdQxn&branch=api/development)](https://magnum.travis-ci.com/clevertech/Waivecar)
[![Coverage Status](https://devops.clevertech.biz/api/coverage/badge?token=fhrk45ASDA45asdkj545434343&repo=clevertech%2FWaivecar&branch=api/development)](https://devops.clevertech.biz/api/coverage/report?token=fhrk45ASDA45asdkj545434343&repo=clevertech%2FWaivecar&branch=api/development)

## Install

```bash
# create a waivecar folder and cd in to the folder.
mkdir waivecar && cd ./waivecar

# clone the repo in to an api local repo
git clone git@github.com:clevertech/waivecar.git api

# change dir to the cloned repo
cd api

# ensure you are running on the /api/development branch

# install dev dependencies
npm install -d

# install gulp cli
npm install -g gulp

# build bower/less files
gulp postinstall
```

Non-Default Features:
- built/building to be API only so no view features will be available (e.g. no support for req.flash, sessions, etc.)
- JSON Web Tokens to be used for security and all routes (other than auth) will be secured.
- `/lib` includes some helpers that are used to auto-wire up routing and controllers.
- `/app/policies` are used to secure the application or inject any middleware-type operations.
- `/etc/data` is a crude data migration strategy to enable seeding of data (and simple data migrations).
- `/app/services` is a services layer to be used when more than simple CRUD is needed.
- `/app/services/job-service` is a hook in to `Kue` to enable out of process jobs to be scheduled and run (using redis as a store).


## Configuration

Configuration (e.g. database and logging setting per environment) is stored in `boot/config.js`.

Be sure to create a `local.js` file in `boot/config.js` to override some default config values. Your file should look something like the following:
```
/*jshint camelcase: false */

// This configuration file is specific to each developer's environment,
// and will merge on top of all other settings from ./config.js
// (but only will merge in development environment)
exports = module.exports = function() {
  return {
    cache: false,
    bypassSecurity: true,
    cleanOnRestart: true,
    url: 'http://localhost:3000',
    admin: {
      email: 'john.smith@example.com',
      password: 'lollipop0',
      firstName: 'Site',
      lastName: 'Administrator'
    }
  };
};

exports['@singleton'] = true;
```


THE INFORMATION BELOW THIS IS YET TO BE REVIEWED.

## Usage

### Development

Default:

```bash
node app
```

Debugging:

```bash
DEBUG=* node app
```

#### Gulp tasks:

```bash
# Run 'bower', 'less', and 'jshint' tasks
gulp postinstall

# Runs 'build'
gulp

# Run jshint to check syntax of JavaScript files
gulp jshint

# Runs 'clean', 'bower', 'less', 'copy', 'imagemin', 'usemin-css', 'usemin-js', and 'usemin-jade'
gulp build

# Runs 'watch-noapp', running the app with nodemon and livereload
gulp watch

# Runs 'watch-noreload', and starts a livereload server to automatically refresh your browser when changes are done
gulp watch-noapp

# Watches changes to public assets (images, fonts, less/css, js, and jade files) and runs appropriate tasks ('imagemin', 'less'/'usemin-css', 'usemin-js', 'usemin-jade') to parse them
gulp watch-noreload

# Run less to create CSS files
gulp less

# Optimizes and copies images to 'assets/dist/img'
gulp imagemin

# Adds versions to JS files, copying them later to 'assets/dist/js'
gulp usemin-js

# Adds versions to CSS files, optimizes and parses images and CSS files as well, copying them later to 'assets/dist'
gulp usemin-css

# Adds versions to assets in JADE files, optimizes and parses assets, copying them later to 'assets/dist'
gulp usemin-jade

# Cleans 'assets/dist' and 'bower_components' directories
gulp clean

# Copies some static files (favicon, robots.txt, etc) to 'assets/dist'
gulp copy
```

### Production

> Production environment requires that you have built out the "assets/dist" folder.

Build project with [gulp.js](http://gulpjs.com/):

```bash
gulp build
```

> Now you can proceed to running in production mode with optional `recluster` support.

Default:

```bash
sudo NODE_ENV=production node app
```

[Recluster](https://github.com/doxout/recluster):

```bash
sudo NODE_ENV=production node cluster
# kill -s SIGUSR2 %d
```


## Tests

```bash
npm test
```


## Contributors

See "package.json" for a list of contributors.  Learn how to add contributors using [npm's docs](https://www.npmjs.org/doc/files/package.json.html#people-fields-author-contributors).


## License

**TODO**: [Choose a license](http://choosealicense.com/) and insert it here.
