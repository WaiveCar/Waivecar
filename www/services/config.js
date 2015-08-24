var baseUrl = 'https://api-waivecar-dev.cleverbuild.biz';
function Config() {
  this.configData={
    uri: {
      api      : baseUrl,
      auth     : {
        login  : baseUrl +'/auth/login',
        logout : baseUrl +'/auth/logout',
        forgot : baseUrl +'/auth/forgot-password',
        reset  : baseUrl +'/auth/reset-password'
      },
      web      : 'https://web-waivecar-dev.cleverbuild.biz',
      admin    : 'https://admin-waivecar-dev.cleverbuild.biz',
      assets   : '',
      vehicles : {
        getNearby : baseUrl + '/cars'
      }
    },
    satellizer: {
      facebook: {
        clientId: '1022707721082213',// '783941098370564',
        url: baseUrl+'/auth/facebook'
      }
    }
  };
  var self=this;
  this.$get=[
    function(){
        return self.configData;
      
    }
  ];

}
angular.module('config',[])
.provider('$config', [
  Config
]);