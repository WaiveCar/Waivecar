module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | Subscription
   |--------------------------------------------------------------------------------
   |
   | @param {Array} services Array of available subscription services.
   | @param {Object} mailchimp Mailchimp service configuration.
   |
   */

  subscription : {
    services : [
      'mailchimp'
    ],
    mailchimp : {
      key  : '67050e8fd7873b97aec41539c76534e6-us11',
      list : '8f098efe24'
    }
  },
  gmaps: {
    apiKey: 'AIzaSyD3Bf8BTFI_z00lrxWdReV4MpaqnQ8urzc'
  }
};
