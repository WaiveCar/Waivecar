function Config() {
  var baseUrl = 'https://api-waivecar-dev.cleverbuild.biz';

  return {
    uri: {
      api: baseUrl,
      auth: {
        signin: baseUrl+'/auth/signin',
        signup: baseUrl+'/auth/signup',
        forgot: baseUrl+'/auth/forgot-password',
        reset: baseUrl+'/auth/reset-password'
      },
      web: 'https://web-waivecar-dev.cleverbuild.biz',
      admin: 'https://admin-waivecar-dev.cleverbuild.biz',
      assets: '',
      vehicles:{
           getNearby: baseUrl + '/cars'
      }
    },
    satellizer: {
      facebook: {
        clientId: '783941098370564',
        url: baseUrl+'/auth/facebook'
      }
    }
  };
}

angular.module('app')
.factory('Config', [
  Config
]);
