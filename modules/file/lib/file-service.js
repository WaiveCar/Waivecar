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

  *store(query, payload, _user) {
    // The conditional below is done because when files are uploaded for insurance,
    // they need to be associated with the correct user rather than the uploader
    if (query.userId) {
      _user.id = Number(query.userId);
    }
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

  *putS3(files, bucket) {
    try {
      let storage = new S3();
      yield storage.upload(files, bucket);
    } catch (err) {
      yield this.deleteFiles(files);
      throw err;
    }
  }

  *index(query, _user) {
    let order;
    if (query.collectionId === 'insurance') {
      order = [['created_at', 'asc']];
    }
    if (_user.hasAccess('admin')) {
      let actualQuery = queryParser(query, {
        where : {
          userId       : queryParser.NUMBER,
          collectionId : queryParser.STRING,
          name         : queryParser.STRING,
          mime         : queryParser.STRING,
          store        : queryParser.STRING,
          bucket       : queryParser.STRING,
          comment      : queryParser.STRING,
        },
      })
      actualQuery.order = order;
      let output = yield File.find(actualQuery);
      return output;
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
      if (query.userId) {
        whereQuery.userId = query.userId;
      }
      if (query.collectionId) {
        whereQuery.collectionId = query.collectionId;
      }
    } else {
      whereQuery.private = false;
    }

    let queryObj = { where: whereQuery };
    if (query.collectionId === 'insurance') {
      queryObj.order = [['created_at', 'asc']];
    }
    return yield File.find(queryObj);
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

  *delete(fileId, query, _user) {
    let file     = yield this.getFile(fileId, _user);
    let deleted  = hooks.get('file:delete');
    let hasHooks = Object.keys(query).length ? true : false;

    switch (file.store) {
      case 'local' : {
        yield Storage.delete(file);
        break;
      }
      case 's3' : {
        //
        // We need to store the person's previous pictures
        // in the case of fraud.
        //
        // yield S3.delete(file);
        //
        break;
      }
      default : {
        throw error.parse({
          code    : 'FILE_UNKNOWN_STORE',
          message : 'The file requested is registered in an unknown storage location'
        }, 400);
      }
    }

    if (hasHooks) {
      yield deleted(query, file, _user);
    }
    yield file.delete();
  }

};

module.exports = new FileService();
