FROM ubuntu:18.04
ENV DEBIAN_FRONTEND noninteractive
ENV NODE_ENV development

RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get install -y redis-server 
RUN apt-get install -y nginx
COPY ./nginx.conf ./
RUN cp nginx.conf /etc/nginx
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -E -
RUN apt-get install -y vim
RUN apt-get install -y nodejs
RUN mkdir /var/log/outgoing /var/log/invers
RUN chmod 0777 /var/log/outgoing /var/log/invers
RUN chmod 1777 /tmp
ADD ./ ./
RUN rm dump.rdb

CMD ["./start-docker.sh"]
