#!/bin/bash
#DEBUG=api:* NODE_ENV=development nodemon -L --debug run.js |& tee -a /tmp/log.log
ENV=development
[ -e .env ] && source .env
DEBUG=api:* NODE_ENV=$ENV node --trace-warnings run.js |& tee -a /tmp/log.log
