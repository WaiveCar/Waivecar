FROM ubuntu:latest
ENV DEBIAN_FRONTEND noninteractive


RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git
RUN apt-get install -y redis-server 
RUN apt-get install -y nginx
COPY ./nginx.conf ./
RUN cp nginx.conf /etc/nginx
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -E -
RUN apt-get install -y nodejs
RUN mkdir /var/log/outgoing /var/log/invers
RUN chmod 0777 /var/log/outgoing /var/log/invers
RUN echo "127.0.0.1 datastore" >> /etc/hosts
RUN service nginx restart
ADD package.json ./

RUN npm install
EXPOSE 6379
EXPOSE 3080

CMD ["node", "NODE_ENV=development", "run.js"]
