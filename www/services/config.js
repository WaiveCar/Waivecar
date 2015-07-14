function Config() {
  var baseUrl='https://api-waivecar-dev.cleverbuild.biz/v1';
  return {
    uri: {
      api: baseUrl+'/v1',
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
        getNearby:baseUrl+'/v1/vehicles/'
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
.factory('config', [
  Config
]);
