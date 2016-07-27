# Web

  - [Setup](#setup)
  - [Usage](#usage)
  - [Linting](#linting)
  - [Host](#host)

## [Setup](#setup)

This stack is known to work only on node 4.2. 

To get yourself there, there is a tech called "nvm" which is similar to "rvm" for changing the current version of node.
The nvm people suggest you put it in your `~/.bashrc` but this imposes an expensive overhead to shell startup.  Instead, I
have an `nvmsh` in my `~/bin` directory. This can be found in `tools/nvmsh`.  This tool doesn't *install* 4.2 of node; you
have to do that yourself.

The rest of the documentation here presumes you are in the context of the 4.2 walled garden and less importantly (but maybe important) on 
Debian 8.0 (jessie).  There will be special notes to that effect if I (cjm) think that its important although tbh, it's the only platform
I'm using this on.

## Routes

The actual routing logic is burried a bit deep at src/templates/app/index.jsx.


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
