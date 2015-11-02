'use strict';

let path   = require('path');
let server = require('bentojs-socket');
let config = require('bentojs-config');

// ### Configuration

config = config(path.resolve('./config'));

// ### Server

server(config.socket);