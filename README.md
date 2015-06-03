# Waivecar - Admin

    $ npm install
    $ bower install
    $ gulp

To start in development mode

    $ gulp app

To test prod / stag mode with minimized files

    $ gulp dist

It will start a local server at [http://localhost:3081](http://localhost:3081) with livereload.

## Configuration files

Configuration is based on [node-config](https://github.com/lorenwest/node-config).

Configuration files in the config directory are loaded in the following order:

    default.EXT
    hostname.EXT
    deployment.EXT
    hostname-deployment.EXT
    runtime.json

You can create a file in `config/$HOSTNAME-$NODE_ENV.json` to override the config for local development. In my case I have `kilian-development.json` having

    $ echo $HOSTNAME $NODE_ENV
    kilian development

with the following content

```json
{
  "api_uri": "http://localhost:8081/1"
}
```