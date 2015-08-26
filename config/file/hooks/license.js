'use strict';

let shortid        = require('shortid');
let FileModule     = Reach.module('file');
let licenseService = Reach.module('license/lib/license-service');

FileModule.hook('license', {

  /**
   * Validate that the required record exists before attempting file upload.
   * @method validate
   * @param  {User} _user
   */
  validate : function *(_user) {
    let model = yield licenseService.get(this.license, _user);
    if (!model) {
      throw error.parse({
        code    : 'FILE_UPLOAD_FAILED',
        message : 'The license your are attempting to attach your image to does not exist'
      }, 400);
    }
  },

  /**
   * Create a shared collection id for files that belongs to a single record.
   * @method collection
   * @param  {User} _user
   * @return {String}
   */
  collection : function *(_user) {
    let license = yield licenseService.get(this.license, _user);
    if (!license.fileId) {
      license.fileId = shortid.generate();
      yield license.update();
    }
    return license.fileId;
  }

});