FROM ubuntu:18.04
ENV DEBIAN_FRONTEND noninteractive
ENV NODE_ENV development
WORKDIR /app

RUN apt-get update \
    && apt-get install -y apt-utils \
    && apt-get install -y curl git redis-server nginx vim \
    && curl -sL https://deb.nodesource.com/setup_8.x | bash -E - \
    && apt-get install -y nodejs \
    && apt-get full-upgrade -y

RUN mkdir /var/log/outgoing /var/log/invers \
    && chmod 0777 /var/log/outgoing /var/log/invers \
    && chmod 1777 /tmp

COPY ./nginx.conf /etc/nginx/
COPY ./package*.json ./
RUN npm install
COPY ./ ./
#RUN rm dump.rdb

CMD ["./start-docker.sh"]
