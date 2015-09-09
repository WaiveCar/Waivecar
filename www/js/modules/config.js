var baseUrl = 'https://api-waivecar-dev.cleverbuild.biz';

angular.module('config',[])
.provider('$config', [
  function Config() {
    var self = this;

    self.config = {

      uri: {
        api      : baseUrl,
        auth     : {
          login  : baseUrl +'/auth/login',
          logout : baseUrl +'/auth/logout',
          forgot : baseUrl +'/auth/forgot-password',
          reset  : baseUrl +'/auth/reset-password'
        }
      },

      facebook: {
        clientId: '1022707721082213',// '783941098370564',
        url: baseUrl+'/auth/facebook'
      }

    };

    self.$get= [
      function() {
        return self.config;
      }
    ];
  }
]);
