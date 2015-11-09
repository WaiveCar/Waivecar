FROM node:4.2.1
MAINTAINER Clevertech DevOps <support@clevertech.biz>

RUN npm install nodemon -g --loglevel warn

# Do not use cache when we change node dependencies in package.json
ADD package.json /tmp/package.json
RUN cd /tmp && npm install --loglevel warn
RUN mkdir -p /opt/web && cp -a /tmp/node_modules /opt/web/

WORKDIR /opt/web
ADD . /opt/web/
RUN cd /opt/web

EXPOSE 8080

CMD ["npm", "run", "local"]
