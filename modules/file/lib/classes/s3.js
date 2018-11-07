'use strict';

let fs      = require('fs');
let path    = require('path');
let knox    = require('knox');
let through = require('through2');
let Storage = require('./storage');
let config  = Bento.config.file;
let error   = Bento.Error;
let log     = Bento.Log;

module.exports = class S3 {

  constructor() {
    if (!validateConfig()) {
      throw error.parse({
        code    : 'FILE_S3_UNAVAILABLE',
        message : 'S3 service has not been enabled for this API'
      }, 400);
    }
    this.streamFile = streamFile;
    this.getClient = getClient;
  }

  *upload(files, bucket) {
    let client = knox.createClient({
      key    : config.providers.s3.key,
      secret : config.providers.s3.secret,
      bucket : bucket || config.providers.s3.bucket
    });

    if (config.providers.s3.region) {
      client.region = config.providers.s3.region;
    }

    let awsRegion = null;
    switch (client.region) {
      case 'us-standard'    : // Default region set by knox
      case 'us-east-1'      : awsRegion = 'external-1';     break;
      case 'us-west-1'      : awsRegion = 'us-west-1';      break;
      case 'us-west-2'      : awsRegion = 'us-west-2';      break;
      case 'eu-west-1'      : awsRegion = 'eu-west-2';      break;
      case 'eu-central-1'   : awsRegion = 'eu-central-1';   break;
      case 'ap-southeast-1' : awsRegion = 'ap-southeast-1'; break;
      case 'ap-southeast-2' : awsRegion = 'ap-southeast-2'; break;
      case 'ap-northeast-1' : awsRegion = 'ap-northeast-1'; break;
      case 'sa-east-1'      : awsRegion = 'sa-east-1';      break;
      default : {
        throw error.parse({
          code    : 'FILE_S3_INVALID_REGION',
          message : 'The S3 region configured does not exist.',
          data    : {
            region : client.region
          }
        }, 400);
      }
    }

    client.host    = `${ client.bucket }.s3-${ awsRegion }.amazonaws.com`;
    client.urlBase = `${ client.bucket }.s3-${ awsRegion }.amazonaws.com`;

    for (let i = 0, len = files.length; i < len; i++) {
      yield uploadFile(files[i], client);
    }
  }

  /**
   * Returns a read stream or a redirect.
   * @param  {Object} ctx
   * @param  {Object} file
   * @return {Mixed}
   */
  static *read(ctx, file) {
    let client = getClient(file);
    if (file.private) {
      return streamFile(file, client, {forLicenseCheck: true});
    }
    let url = client.http(file.path);
    return ctx.redirect(url);
  }

  /**
   * Deletes a file from S3.
   * @param {Object} file
   */
  static *delete(file) {
    let client = getClient(file);
    yield new Promise((resolve, reject) => {
      client.deleteFile(file.path, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
    yield Storage.delete(file);
  }

};

/**
 * @private
 * @method getClient
 * @param  {File} file
 */
function getClient(file) {
  if (!validateConfig()) {
    throw error.parse({
      code    : 'FILE_S3_UNAVAILABLE',
      message : 'The S3 service is currently unavailable'
    }, 409);
  }
  let client = knox.createClient({
    key    : config.providers.s3.key,
    secret : config.providers.s3.secret,
    bucket : file.bucket
  });
  if (config.providers.s3.region) {
    client.region = config.providers.s3.region;
  }
  return client;
}

function validateConfig() {
  return (config.providers.s3 && config.providers.s3.key && config.providers.s3.secret);
}

/**
 * @private
 * @method uploadFile
 * @param  {File} file
 * @param  {Knox} client
 */
function *uploadFile(file, client) {
  let location = path.join(config.providers.local.path, file.path);
  let target   = fs.createReadStream(location);
  let bucket   = client.put(file.path, {
    'content-length' : file.size,
    'content-type'   : file.mime,
    'x-amz-acl'      : file.private ? 'private' : 'public-read'
  });

  // ### Upload File

  target.pipe(bucket);
  yield new Promise((resolve, reject) => {
    bucket.on('response', (res) => {
      if (res.statusCode !== 200) {
        //console.log(res);
        return reject({
          status  : 400,
          code    : 'FILE_S3_UPLOAD',
          message : 'The file upload to S3 failed.',
          data    : {
            statusCode    : res.statusCode,
            statusMessage : res.statusMessage,
            host          : client.host,
            urlBase       : client.urlBase,
            endpoint      : client.endpoint,
            region        : client.region
          }
        });
      }
      log.info(`Uploaded ${ file.path } to S3 bucket ${ client.options.bucket }`);
      resolve();
    });
  });

  // ### Update File

  yield file.update({
    store  : 's3',
    bucket : client.options.bucket
  });

  // ### Delete Local File

  fs.unlink(location);
}

function streamFile(file, client, opts={}) {
  let stream = through();
  client.getFile(file.path, (err, res) => {
    if (err) {
      stream.end(500);
    }
    if (res.statusCode !== 200) {
      stream.end(500);
    } else {
      res.pipe(stream);
      if (opts.forLicenseCheck) {
        res.pipe(fs.createWriteStream(`./${opts.checkrId}-license.jpg`));
      }
    }
  });
  stream.on('close', () => {
    log.info(`FileHandler: ${ file.path } was streamed from S3 bucket`);
  });
  return stream;
}
