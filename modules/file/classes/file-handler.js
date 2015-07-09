/**
  Files
  =====

  Stability: 2 - Unstable

  @author  Christoffer Rødvik
  @license MIT
 */

'use strict';

var coFs   = require('co-fs');
var path   = require('path');
var saveTo = require('save-to');
var mime   = require('mimetype');
var queue  = Reach.service('queue');
var File   = Reach.model('File');

module.exports = (function () {

  /**
   * @class FileHandler
   */
  function FileHandler() {}

  /**
   * Upload a file to the local api storage
   * @method local
   * @param  {Object} post
   * @param  {String} options
   * @return {Array}  files
   */
  FileHandler.local = function *(post, options) {
    let opts    = options || {};
    let folder  = opts.tmp ? 'tmp' : (opts.folder || '');
    let storage = path.join(Reach.STORAGE_PATH, folder);
    let files   = [];
    let part;

    // ### Storage
    // If a custom folder has been designated we want to make sure
    // it exists or create it.

    if (opts.folder && !coFs.exists(storage)) {
      yield coFs.mkdir(storage);
    }

    // ### Handle

    while (part = yield post) {
      let filename = uid() + path.extname(part.filename);
      let filepath = path.join(storage, filename);

      yield saveTo(part, filepath);

      let stat = yield coFs.stat(filepath);
      let file = new File({
        name   : filename,
        source : 'local',
        folder : opts.folder || null,
        path   : filepath,
        mime   : mime.lookup(filename),
        size   : stat.size
      });

      yield file.save();

      files.push(file.toJSON());
    }

    return files;
  };

  /**
   * Upload a file to a AWS S3 Bucket
   * @method S3
   * @param  {Object} post
   * @param  {String} [bucket]
   * @return {Array}  files
   */
  FileHandler.S3 = function *(post, bucket) {
    let files = yield FileHandler.local(post, {
      tmp : true
    });

    queue
      .create('S3 Upload', {
        files  : files,
        bucket : bucket
      })
      .removeOnComplete(true)
      .save(function (err) {
        if (err) {
          Reach.Logger.error('Queue: S3 Upload job [%s] error', err);
        }
      })
    ;

    return files;
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