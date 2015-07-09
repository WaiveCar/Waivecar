'use strict';

var fs   = require('fs');
var path = require('path');
var co   = require('co');
var knox = require('knox'); // AWS S3
var File = Reach.model('File');

module.exports = (function () {

  /**
   * Provides access to S3 operators for easy handling.
   * @class S3
   */
  function S3() {}

  /**
   * @method upload
   * @param  {Array}    files List of files to handle
   * @param  {Function} done
   */
  S3.upload = function (files, bucket, done) {
    let config = getS3Config();

    if (!config) {
      done('This API is not setup for S3 uploads');
      return;
    }

    let client = knox.createClient({
      key    : config.key,
      secret : config.secret,
      bucket : bucket || config.bucket
    });

    uploadFiles(files, client, done);
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

    let file   = files.pop();
    let target = fs.createReadStream(file.path);
    let bucket = client.put((file.folder ? file.folder + '/' + file.name : file.name), {
      'content-length' : file.size,
      'content-type'   : file.mime
    });

    target.pipe(bucket);

    bucket.on('response', function (res) {
      if (200 !== res.statusCode) {
        Reach.Logger.error('S3 upload failed with status: ' + res.statusCode + ' ' + res.statusMessage);
        return uploadFiles(files, client, done);
      }

      co(function *() {
        file = yield File.find({ where : { id : file.id }, limit : 1 });
        yield file.update({
          source : 'S3',
          path   : bucket.url
        });
        fs.unlink(path.join(Reach.STORAGE_PATH, 'tmp', (file.folder ? file.folder + '/' + file.name : file.name)));
        Reach.Logger.info('FileHandler: %s was uploaded to S3 bucket', file.name);
        uploadFiles(files, client, done);
      });
    });
  }

  /**
   * @private
   * @method getS3Config
   * @return {Mixed} Returns a boolean or the config object
   */
  function getS3Config() {
    var config = Reach.config.S3;
    if (!config || !config.key || !config.secret) {
      return false;
    }
    return config;
  }

  return S3;

})();