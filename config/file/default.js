module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | AWS S3
   |--------------------------------------------------------------------------------
   |
   | Enter your Amazon S3 information in this file.
   |
   | types : A list of allowed file types
   | limit : The max file size allowed by the api in kilobytes
   | s3        : Amazon S3
   |   key    : aws_access_key_id
   |   secret : aws_secret_access_key
   |   bucket : default aws bucket
   |   region : default aws region
   |
   */

  file : {
    types : [ 'jpg', 'png' ],
    limit : 2048,
    s3 : {
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