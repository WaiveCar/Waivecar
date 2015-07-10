WaiveCar API
============

### NODE

Do not run with NODE `0.12.5`, it currently has install issues with istanbul. `0.12.4` is recommended.

### Install

First download this repo and unpack it into your destination of choice, then open your terminal and run npm install to install all the dependencies for the api.

```sh
# Install NPM packages
$ npm install

# Nodemon for local development
$ npm install -g nodemon
```

### Startup

After installing the npm dependencies, reach modules and services you can startup your server.

```sh
$ npm run local
$ npm run dev
$ npm run stag
$ npm run prod
$ NODE_ENV=env node --harmony server.js
```