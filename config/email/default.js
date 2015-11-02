module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | Email
   |--------------------------------------------------------------------------------
   |
   | @param {String} templateFolder
   | @param {Object} sender
   | @param {String} transportName
   | @param {Object} transport
   |
   */

  email : {
    templateFolder : 'config/email/templates',
    sender         : 'dev@waivecar.com',
    transportName  : 'mandrill',
    transport      : {
      auth : {
        apiKey : 'gHCYiqaKVIzJqfPqbrtPOA'
      }
    }
  }
};
