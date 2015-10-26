'use strict';

let License = Reach.model('License');
let error   = Reach.Error;

module.exports = class LicenseFile {
  
  /**
   * Validates the license by verifying that it has been defined.
   * @param {Number} licenseId
   */
  static *validate(licenseId) {
    let license = yield License.findById(licenseId);
    if (!license) {
      throw error.parse({
        code    : `INVALID_LICENSE`,
        message : `The provided license id does not exist.`
      }, 400);
    }
  }

  /**
   * Attaches the file to the license.
   * @param {Number} licenseId
   * @param {Object} file
   */
  static *capture(licenseId, file) {
    let license = yield License.findById(licenseId);
    yield license.update({
      fileId : file.id
    });
  }

  /**
   * Remove the fileId from the license record.
   * @param {Number} licenseId
   */
  static *delete(licenseId) {
    let license = yield License.findById(licenseId);
    yield license.update({
      fileId : null
    });
  }

}