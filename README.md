# Web

  - [Setup](#setup)
  - [Usage](#usage)
  - [Linting](#linting)
  - [Host](#host)

## [Setup](#setup)

Start by running npm install to get all the dependencies.

```sh
$ npm install
```

## [Usage](#usage)

```sh
# Local Development
$ npm run local
```

## [Linting](#linting)

This boilerplate project includes React-friendly ESLint configuration.

```sh
$ npm run lint
```

## [Host](#host)

You may want to change the host in `server.js` and `webpack.config.js` from `localhost` to `0.0.0.0` to allow access from same WiFi network. This is not enabled by default because it is reported to cause problems on Windows. This may also be useful if you're using a VM.