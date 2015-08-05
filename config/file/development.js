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
      key    : 'AKIAJ6QDZ6GTKEUAYN5A',
      secret : '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',
      bucket : 'waivecar-dev'
    }
  }
  
};