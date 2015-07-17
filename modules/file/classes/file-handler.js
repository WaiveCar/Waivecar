/**
  Files
  =====

  Stability: 2 - Unstable

  @author  Christoffer Rødvik
  @license MIT
 */

'use strict';

let fs     = require('co-fs');
let oFs    = require('fs');
let path   = require('path');
let saveTo = require('save-to');
let mime   = require('mimetype');
let S3     = require('./S3');
let queue  = Reach.service('queue');
let File   = Reach.model('File');
let log    = Reach.Log;

module.exports = (function () {

  /**
   * @class FileHandler
   */
  function FileHandler() {}

  /**
   * Upload a file to the local api storage
   * @method local
   * @param  {Object} post
   * @return {Array}  files
   */
  FileHandler.local = function *(post) {
    let storage = path.join(Reach.STORAGE_PATH);
    let files   = [];
    let part;

    // ### Handle

    while (part = yield post) {
      let filename = uid() + path.extname(part.filename);
      let filepath = path.join(storage, filename);

      yield saveTo(part, filepath);

      let stat = yield fs.stat(filepath);
      let file = new File({
        path    : filename,
        mime    : mime.lookup(filename),
        size    : stat.size,
        store   : 'local',
        private : post.private
      });

      yield file.save();

      files.push(file.toJSON());
    }

    return files;
  };

  /* istanbul ignore next: S3 does not have testing facilities */

  /**
   * Upload a file to a AWS S3 Bucket
   * @method S3
   * @param  {Object} post
   * @param  {String} [bucket]
   * @return {Array}  files
   */
  FileHandler.S3 = function *(post, bucket) {
    let files = yield FileHandler.local(post);
    queue
      .create('S3 Upload', {
        files  : files,
        bucket : bucket
      })
      .removeOnComplete(true)
      .save(function (err) {
        if (err) {
          log.error('Queue: S3 Upload job [%s] error', err);
        }
      })
    ;
    return files;
  };

  /**
   * Downstream a file to the client.
   * @method fetch
   * @param  {Object} koa
   * @param  {Int}    id
   * @return {Mixed}
   */
  FileHandler.fetch = function *(koa, id) {
    let file = yield File.find({ where : { id : id }, limit : 1 });

    if (!file) {
      koa.throw({
        code    : 'FILE_NOT_FOUND',
        message : 'The requested file does not exist'
      }, 404);
    }

    if ('local' === file.store) {
      koa.type = file.mime;
      return oFs.createReadStream(path.join(Reach.STORAGE_PATH, file.path));
    }

    /* istanbul ignore next */

    if ('s3' === file.store) {
      if (file.private) {
        return S3.stream(koa, file);
      } else {
        return S3.redirect(koa, file);
      }
    }

    koa.throw({
      code    : 'FILE_UNKNOWN_STORE',
      message : 'The file requested is registered in an unknown storage location'
    }, 400);
  };

  /**
   * @private
   * @method uid
   * @return {String}
   */
  function uid() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  return FileHandler;

})();