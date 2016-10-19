#!/bin/bash
ENV=development
[ -e .env ] && source .env
DEBUG=api:* NODE_ENV=$ENV node socket.js |& tee -a /tmp/log.log
