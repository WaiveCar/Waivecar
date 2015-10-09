WaiveCar API
============

[![Build Status](https://magnum.travis-ci.com/clevertech/Waivecar.svg?token=EMVjzHuEYHd2d2DHdQxn&branch=api/development)](https://magnum.travis-ci.com/clevertech/Waivecar)
[![Coverage Status](https://devops.clevertech.biz/api/coverage/badge?token=fhrk45ASDA45asdkj545434343&repo=clevertech%2FWaivecar&branch=api/development)](https://devops.clevertech.biz/api/coverage/report?token=fhrk45ASDA45asdkj545434343&repo=clevertech%2FWaivecar&branch=api/development)

### Install

First download this repo and unpack it into your destination of choice, then open your terminal and run npm install to install all the dependencies for the api.

```sh
# Install reach-cli.
$ npm install -g reach

# Install NPM dependencies.
$ npm install

# Install reach api packages.
$ reach install
```

### Startup

After installing the npm dependencies, reach modules and services you can startup your server.

```sh
$ npm run local
$ npm run dev
$ npm run stag
$ npm run prod
$ NODE_ENV=env node --harmony server.js
```

### View Import/Export

Views reside in a mongo database in a View collection.

To import existing views in to your database:

```sh
mongoimport --db waivecar_local --collection views --upsert --file ./fixtures/views.json
```

To update the export with what you have locally:

```sh
mongoexport --db waivecar_local --collection views --out ./fixtures/views.json
```
