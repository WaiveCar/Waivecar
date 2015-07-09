Reach API
=========

[![Build Status](https://travis-ci.org/reach/api.svg?branch=development)](https://travis-ci.org/reach/api)
[![Coverage Status](https://coveralls.io/repos/reach/api/badge.svg)](https://coveralls.io/r/reach/api)

A back end API service setup that gives you the ability to pick and choose the modules you need for your project, mainly developed for the way I enjoy setting up my back end along with the ideas and wishes of my programming peers. It is built on KOA and Socket.io creating a robust and accessible experience for your development.

Please refer to the [wiki](https://github.com/Kodemon/reach-api/wiki) for full documentation.

### NODE

Do not run with NODE `0.12.5`, it currently has install issues with istanbul. `0.12.4` is recommended.

### Install

First download this repo and unpack it into your destination of choice, then open your terminal and run npm install to install all the dependencies for the api.

```sh
# Install NPM packages
$ npm install

# Install reach-cli [optional]
$ npm install -g reach-cli

# Nodemon for local development [optional]
$ npm install -g nodemon
```

### Startup

After installing the npm dependencies, reach modules and services you can startup your server.

```sh
$ npm run local # Requires nodemon, edit the package.json scripts to change nodemon to node
$ npm run dev
$ npm run stag
$ npm run prod
$ NODE_ENV=env node --harmony server.js
```

### WARNING

**DO NOT USE IN PRODUCTION**

This API is in pre-alpha and is very much subject to major changes until we hit beta. Please make sure to keep an eye on the stability reports in the wiki.

### License

The MIT License (MIT)

Copyright (c) 2015 Christoffer Rødvik

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
