module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | AWS S3
   |--------------------------------------------------------------------------------
   |
   | Enter your Amazon S3 information in this file.
   |
   | fileTypes : A list of allowed file types
   | s3        : Amazon S3
   |   key    : aws_access_key_id
   |   secret : aws_secret_access_key
   |   bucket : default aws bucket
   |   region : default aws region
   |
   */

  file : {
    fileTypes : [ 'jpg', 'png' ],
    s3 : {
      key    : null,
      secret : null,
      bucket : null,
      region : null
    }
  }

};