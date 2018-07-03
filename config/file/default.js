module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | File
   |--------------------------------------------------------------------------------
   |
   | @param {Array}  types     The file types accepted by the file handler.
   | @param {Number} limit     The file size limit accepted.
   | @param {Object} providers Provider settings and default assignments.
   |
   */

  file : {
    types     : [ 'jpg', 'jpeg', 'png', 'gif', 'bmp' ],
    limit     : 204800,
    providers : {
      default : 'local',
      local   : {
        path : '/tmp/bentojs/storage'
      },
      s3 : {
        key    : null,
        secret : null,
        bucket : null,
        region : null
      }
    }
  }

};
