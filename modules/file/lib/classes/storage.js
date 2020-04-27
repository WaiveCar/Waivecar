'use strict';

let fs     = require('fs');
let parse  = require('co-busboy');
let path   = require('path');
let mime   = require('mimetype');
let File   = Bento.model('File');
let error  = Bento.Error;
let rndm   = Bento.Helpers.Random;
let config = Bento.config.file;

module.exports = class Storage {

  /**
   * Handles the initial setup and parses the post body.
   * @param {Object} post
   */
  constructor(post) {
    this.files = [];
    this.parts = parse(post, {
      autoFields : true
    });
  }

  /**
   * Parses the fields and populates the storage instance with the provided data.
   */
  prepareFields() {
    let field = this.parts.field;
    for (let key in field) {
      if (!this.hasOwnProperty(key)) {
        this[key] = field[key];
      }
    }
  }

  /**
   * Saves the file into the local storage of the API.
   * @param {String} collectionId
   * @param {Object} _user
   */
  *save(collectionId, _user, organizationId=null) {
    let types = config.types, part;

    // ### Handle Files

    while (part = yield this.parts) {
      let filetype = path.extname(part.filename);
      // we just assume jpg and move on with life.
      if (types.length > 0 && types.indexOf(filetype.replace('.', '').toLowerCase()) === -1) {
        filetype = '.jpg';
      }
      let filename = rndm(32) + filetype;
      let filepath = path.join(config.providers.local.path, filename);

      /*
        part.resume();
        throw error.parse({
          code    : `FILE_TYPE_INVALID`,
          message : `You cannot upload invalid file types to the server.`,
          data    : {
            validTypes : types
          }
        }, 400);
      }
      */

      yield this.store(part, filepath, {});

      let payload = this.parts.field;
      if (payload.groupId && !_user.group.hasAccess(payload.groupId)) {
        yield deleteFile(filepath);
        throw error.parse({
          code    : `FILE_GROUP_INVALID`,
          message : `You do not have the required access to upload files to this group.`
        }, 400);
      }
      let stat = yield this.fileStats(filepath);
      let file = new File({
        userId       : _user.id,
        groupId      : payload.groupId,
        collectionId : collectionId,
        private      : payload.private === 'true' ? 1 : 0,
        name         : payload.name || part.filename.substring(0, 127),
        path         : filename,
        mime         : mime.lookup(filename),
        size         : stat.size,
        comment      : payload.comment || null,
        organizationId,
        store        : 'local'
      });
      yield file.save();

      this.files.push(file);
    }

    // ### Post Fields
    // Assigns the additional fields to the created storage instance

    this.prepareFields();
  }

  /**
   * Stores a stream onto the given file path.
   * @param {Object} stream
   * @param {String} destination
   * @param {Object} options
   */
  *store(stream, destination, options) {
    options  = options || {};
    yield new Promise((resolve, reject) => {
      let writeStream = stream.pipe(fs.createWriteStream(destination));
      let received    = 0;

      stream.on('data', (chunk) => {
        received += chunk.length;
      });

      stream.once('close', resolve);
      writeStream.once('close', resolve);
    });
  }

  /**
   * Returns the stats for the file at the given file path.
   * @param  {String} filepath
   * @return {Object}
   */
  *fileStats(filepath) {
    return yield new Promise((resolve, reject) => {
      fs.stat(filepath, (err, stats) => err ? reject(err) : resolve(stats));
    });
  }

  /**
   * Returns a stream of the provided file.
   * @param  {Object} file
   * @return {Stream}
   */
  static *read(file) {
    return fs.createReadStream(path.join(config.providers.local.path, file.path));
  }

  /**
   * Deletes the provided file.
   * @param {Object} file
   */
  static *delete(file) {
    yield deleteFile(path.join(config.providers.local.path, file.path));
    yield file.delete();
  }

};

/**
 * Physically deletes files from server.
 * @param  {String} filepath
 * @return {Void}
 */
function *deleteFile(filepath) {
  try {
    yield new Promise((resolve, reject) => {
      fs.unlink(filepath, (err) => err ? reject(err) : resolve());
    });
  } catch (err) {
    // # IGNORE
    // If the unlink filepath is gone for some reason we ignore
    // the error and move on to the delete the database record.
  }
}
