module.exports = {

  file : {
    types     : [ 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'pdf', 'mov', 'mp4'],
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
