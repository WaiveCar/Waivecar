'use strict';

let Service     = require('./classes/service');
let Storage     = require('./classes/storage');
let S3          = require('./classes/s3');
let queryParser = Bento.provider('sequelize/helpers').query;
let File        = Bento.model('File');
let hooks       = Bento.Hooks;
let error       = Bento.Error;
let config      = Bento.config.file;

class FileService extends Service {

  /**
   * Stores the incoming files.
   * @param  {Object} query
   * @param  {Object} payload
   * @param  {Object} _user
   * @return {Object}
   */
  *store(query, payload, _user) {
    console.log('Query: ', query);
    console.log('Payload: ', payload);
    let validate   = hooks.get('file:validate');
    let collection = hooks.get('file:collection');
    let capture    = hooks.get('file:capture');
    let hasHooks   = Object.keys(query).length ? true : false;

    // ### Validate

    if (hasHooks) {
      yield validate(query);
    }

    // ### Local
    // Prepare collectionId and parse the payload.

    let collectionId = hasHooks ? yield collection(query) : null;
    let storage      = new Storage(payload);

    // ### Store
    // Store the file on the local storage and save file record.

    try {
      yield storage.save(collectionId, _user);
    } catch (err) {
      yield this.deleteFiles(storage.files);
      throw err;
    }

    // ### 3rd Party Service
    // Handle any third party storage request for the uploaded files.

    let target = storage.target || config.providers.default;
    switch (target) {
      case 's3' : {
        yield this.putS3(storage.files, storage.bucket);
        break;
      }
    }

    // ### Single & Capture
    // If a single file was uploaded we check for a capture hook.

    if (hasHooks) {
      for (let i = 0, len = storage.files.length; i < len; i++) {
        yield capture(query, storage.files[i], _user);
      }
    }

    return storage.files;
  }

  /**
   * Stores files to S3.
   * @param {Array}  files
   * @param {String} bucket
   */
  *putS3(files, bucket) {
    try {
      let storage = new S3();
      yield storage.upload(files, bucket);
    } catch (err) {
      yield this.deleteFiles(files);
      throw err;
    }
  }

  /**
   * Returns a list of files.
   * @param  {Object} query
   * @param  {Object} _user
   * @return {Array}
   */
  *index(query, _user) {
    if (_user.hasAccess('admin')) {
      return yield File.find(queryParser(query, {
        where : {
          userId       : queryParser.NUMBER,
          collectionId : queryParser.STRING,
          name         : queryParser.STRING,
          mime         : queryParser.STRING,
          store        : queryParser.STRING,
          bucket       : queryParser.STRING
        }
      }));
    }

    // ### Prepare Query
    // Prepares a where query that differentiates on the existence
    // of an authenticated user.

    let whereQuery = {};
    if (_user) {
      whereQuery.$or = [
        {
          private : false
        },
        {
          userId : _user.id
        }
      ];
    } else {
      whereQuery.private = false;
    }

    return yield File.find({ where : whereQuery });
  }

  /**
   * Returns a file stream.
   * @param  {Object} ctx    The koa request context.
   * @param  {String} fileId The requested file ID.
   * @param  {Object} _user  THe authenticated user making the request.
   * @return {Mixed}
   */
  *show(ctx, fileId, _user) {
    let file = yield this.getFile(fileId, _user);

    // ### MIME
    // Set the mime type on the context for proper rendering.

    ctx.type = file.mime;

    // ### Send
    // Sends the file to the client.

    switch (file.store) {
      case 'local' : {
        return yield Storage.read(file);
      }
      case 's3' : {
        return yield S3.read(ctx, file);
      }
      default : {
        throw error.parse({
          code    : `FILE_UNKNOWN_STORE`,
          message : `The file requested is registered in an unknown storage location`
        }, 400);
      }
    }
  }

  /**
   * Deletes a file.
   * @param  {String} fileId
   * @param  {Object} query
   * @param  {Object} _user
   * @return {Object}
   */
  *delete(fileId, query, _user) {
    let file     = yield this.getFile(fileId, _user);
    let deleted  = hooks.get('file:delete');
    let hasHooks = Object.keys(query).length ? true : false;

    // ### Delete File

    switch (file.store) {
      case 'local' : {
        yield Storage.delete(file);
        break;
      }
      case 's3' : {
        yield S3.delete(file);
        break;
      }
      default : {
        throw error.parse({
          code    : 'FILE_UNKNOWN_STORE',
          message : 'The file requested is registered in an unknown storage location'
        }, 400);
      }
    }

    // ### Delete Hook

    if (hasHooks) {
      yield deleted(query, file, _user);
    }
  }

};

module.exports = new FileService();
