FROM node:4.2.1
MAINTAINER Clevertech DevOps <support@clevertech.biz>

# No further dependencies at the moment
# RUN apt-get update
# RUN apt-get -y install ...

RUN npm install bentojs nodemon -g --loglevel warn

# Do not use cache when we change node dependencies in package.json
ADD package.json /tmp/package.json
RUN cd /tmp && npm install --loglevel warn
RUN mkdir -p /opt/api && cp -a /tmp/node_modules /opt/api/

# TODO Do the same for gulp, bower, etc...

# Node api lives on a layer on its own
WORKDIR /opt/api
ADD . /opt/api/
RUN cd /opt/api && bento package

EXPOSE 8080

CMD ["npm", "run", "local"]
