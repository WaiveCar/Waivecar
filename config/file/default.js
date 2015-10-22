module.exports = {
  file : {

    /**
     * List of file types accepted by the API.
     * @type {Array}
     */
    
    types : [ 'jpg', 'jpeg', 'png', 'gif', 'bmp' ],

    /**
     * Size limit of incoming files.
     * @type {Number}
     */
    
    limit : 2048,

    /**
     * Amazon S3
     * @type  {Object}
     * @param {String} key
     * @param {String} secret
     * @param {String} bucket
     * @param {String} region
     */
    
    s3 : {
      key    : null,
      secret : null,
      bucket : null,
      region : null
    },

    /**
     * UI settings consumed by reach-ui
     * @type {Object}
     */
    
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