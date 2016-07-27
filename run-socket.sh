#DEBUG=api:* NODE_ENV=development nodemon -L --debug run.js |& tee -a /tmp/log.log
DEBUG=api:* NODE_ENV=development nodemon -L socket.js |& tee -a /tmp/log.log
