module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | File
   |--------------------------------------------------------------------------------
   |
   | @param {Array}  types The file types accepted by the file handler.
   | @param {Number} limit The file size limit accepted.
   | @param {Object} s3    The S3 configuration used for Amazon S3 uploads.
   | @param {Object} ui    The bentojs UI configuration.
   |
   */

  file : {
    types : [ 'jpg', 'jpeg', 'png', 'gif', 'bmp' ],
    limit : 2048,
    s3    : {
      key    : null,
      secret : null,
      bucket : null,
      region : null
    },
    ui : {
      resources : {
        files : require('./resources/files')
      },
      fields : {
        files : require('./fields/files')
      }
    }
  }

};
