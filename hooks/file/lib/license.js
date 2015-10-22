'use strict';

let License = Reach.model('License');
let error   = Reach.Error;

class LicenseFile {
  
  /**
   * Validates the license by verifying that it has been defined.
   * @param {Object} query
   */
  *validate(query) {
    let license = yield License.findById(query.id);
    if (!license) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `The provided license id does not exist.`
      }, 400);
    }
  }

  /**
   * Attaches the file to the license.
   * @param {Object} query
   * @param {Object} file
   */
  *capture(query, file) {
    let license = yield License.findById(query.id);
    yield license.update({
      fileId : file.id
    });
  }

  /**
   * Remove the fileId from the license record.
   * @param {Object} query
   */
  *delete(query) {
    let license = yield License.findById(query.id);
    yield license.update({
      fileId : null
    });
  }

}

module.exports = new LicenseFile();