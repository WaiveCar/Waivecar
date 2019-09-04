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
    sender         : 'Waive <support@waive.com>',
    transportName  : 'mailgun',
    transport      : {
      auth : {
        domain: 'waive.com',
        apiKey : '76d6847773f9514f75c80fd3ff4ec882-4167c382-b53ffbc6'
      }
    }
  }

};
