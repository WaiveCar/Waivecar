FROM ubuntu:16.04
ENV DEBIAN_FRONTEND noninteractive
ENV NODE_ENV development
WORKDIR /app

RUN apt-get update \
    && apt-get install -y apt-utils \ 
    && apt-get install -y curl git vim \
    && curl -sL https://deb.nodesource.com/setup_4.x | bash -E - \
    && apt-get install -y nodejs \
    && apt-get full-upgrade -y

COPY ./package.json ./
RUN npm install

COPY ./ ./

EXPOSE 8080

CMD ["./run.sh"]
