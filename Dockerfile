FROM ubuntu:14.04

RUN apt-get update \
 && apt-get install -y --force-yes --no-install-recommends\
      apt-transport-https \
      build-essential \
      curl \
      ca-certificates \
      git \
      lsb-release \
      python-all \
      rlwrap \
      libkrb5-dev \
      g++ \
      gyp \
 && rm -rf /var/lib/apt/lists/*;

RUN curl https://deb.nodesource.com/node_4.x/pool/main/n/nodejs/nodejs_4.2.1-1nodesource1~trusty1_amd64.deb > node.deb \
 && dpkg -i node.deb \
 && rm node.deb

RUN npm install reach nodemon -g

ADD package.json /api/package.json
RUN cd /api && npm install && reach install
ADD . /api

WORKDIR /api
EXPOSE 8081
CMD ["npm", "run", "local"]