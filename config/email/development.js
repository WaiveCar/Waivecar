module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | Email
   |--------------------------------------------------------------------------------
   |
   | Provides an easy to use email transporter that can be used by any bento api
   | module.
   |
   | @param {String}  templateFolder The location of email templates relative to the
   |                                 api root.
   | @param {Object}  sender         The default email address of the sender.
   | @param {String}  transportName
   | @param {Object}  transport
   |
   */

  email : {
    templateFolder : 'templates/email',
    sender         : 'Waive <support@waivecar.com>',
    transportName  : 'mandrill',
    recipient      : 'chris@waivecar.com',
    transport      : {
      auth : {
        apiKey : 'gHCYiqaKVIzJqfPqbrtPOA'
      }
    }
  }

};
