module.exports = {

  file : {
    types     : [ 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'pdf'],
    limit     : 20480000,
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
