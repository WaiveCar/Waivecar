'use strict';

let fs      = require('fs');
let path    = require('path');
let co      = require('co');
let knox    = require('knox'); // AWS S3
let through = require('through2');
let File    = Reach.model('File');
let log     = Reach.Log;

module.exports = (function () {

  /**
   * Provides access to S3 operators for easy handling.
   * @class S3
   */
  function S3() {
    // ...
  }

  /**
   * @property config
   * @type     Object
   */
  S3.config = (function getS3Config() {
    let config = Reach.config.S3;
    if (!config || !config.key || !config.secret) {
      return false;
    }
    return config;
  })();

  /**
   * @method upload
   * @param  {Array}    files List of files to handle
   * @param  {Function} done
   */
  S3.upload = function (files, bucket, done) {
    if (!S3.config) {
      done('The API is not setup for S3 services');
      return;
    }

    let client = knox.createClient({
      key         : S3.config.key,
      secret      : S3.config.secret,
      bucket      : bucket || S3.config.bucket
    });

    uploadFiles(files, client, done);
  };

  /**
   * Redirects client to the source location of the file.
   * @method redirect
   * @param  {Object} koa
   * @param  {Object} file
   */
  S3.redirect = function (koa, file) {
    if (!S3.config) {
      badConfig(koa);
    }
    let client = knox.createClient({
      key    : S3.config.key,
      secret : S3.config.secret,
      bucket : file.bucket
    });
    return koa.redirect(client.http(file.path));
  };

  /**
   * Streams the file content to from S3 bucket to the client.
   * @method stream
   * @param  {Object} koa
   * @param  {Object} file
   * @return {stream}
   */
  S3.stream = function (koa, file) {
    if (!S3.config) {
      badConfig(koa);
    }

    let stream = through();
    let client = knox.createClient({
      key    : S3.config.key,
      secret : S3.config.secret,
      bucket : file.bucket
    });

    client.getFile(file.path, function (err, res) {
      if (err) {
        stream.end(500);
      }
      if (200 !== res.statusCode) {
        stream.end(500);
      } else {
        koa.type = file.mime;
        res.pipe(stream);
      }
    });

    stream.on('close', function () {
      log.info('FileHandler: %s was streamed from S3 bucket', file.path);
    });

    return stream;
  };

  /**
   * @private
   * @method uploadFile
   * @param  {Array}    files
   * @param  {Object}   client
   * @param  {Function} done
   */
  function uploadFiles(files, client, done) {
    if (0 === files.length) {
      return done(); // If no more files to upload we are done!
    }

    co(function *() {
      let pop    = files.pop();
      let file   = yield File.find({ where : { id : pop.id }, limit : 1 });
      let local  = path.join(Reach.STORAGE_PATH, file.path);
      let target = fs.createReadStream(local);
      let bucket = client.put(file.path, {
        'content-length' : file.size,
        'content-type'   : file.mime,
        'x-amz-acl'      : file.private ? 'private' : 'public-read'
      });

      target.pipe(bucket);

      bucket.on('response', function (res) {
        if (200 !== res.statusCode) {
          log.error('S3 upload failed with status: ' + res.statusCode + ' ' + res.statusMessage);
          return uploadFiles(files, client, done);
        }

        co(function *() {
          yield file.update({
            store  : 'S3',
            bucket : client.options.bucket
          });
          fs.unlink(local);
          log.info('FileHandler: %s was uploaded to S3 bucket', file.path);
          uploadFiles(files, client, done);
        });
      });
    });
  }

  /**
   * Throws a bad config error.
   * @method badConfig
   * @param  {Object} koa
   */
  function badConfig(koa) {
    koa.throw({
      code    : 'S3_BAD_CONFIG',
      message : 'The API is not setup for S3 services'
    }, 400);
  }

  return S3;

})();