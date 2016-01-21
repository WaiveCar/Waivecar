'use strict';

let kue         = require('kue');
let changeCase  = Bento.Helpers.Case;
let config      = Bento.config;
let queueConfig = config.queue;

queueConfig.prefix = changeCase.toParam(config.api.name) + ':' + (queueConfig.prefix || 'queue');

module.exports = kue.createQueue(queueConfig);