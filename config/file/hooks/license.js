'use strict';

let shortid        = require('shortid');
let FileModule     = Reach.module('file');
let licenseService = Reach.module('license/lib/license-service');

FileModule.hook('license', {

  /**
   * Validates the license and returns a custom identifier for the file.
   * @method cid
   * @param  {User}   user
   * @param  {Object} data
   */
  cid : function *(user, data) {
    let license = yield licenseService.get(data.license, user);
    if (!license.fileId) {
      license.fileId = shortid.generate();
      yield license.update();
    }
    return license.fileId;
  }

});