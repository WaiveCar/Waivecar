function Config() {
  var apiUri='https://api-waivecar-dev.cleverbuild.biz/v1';
  return {
    uri: {
      api: apiUri,
      auth: {
        signin: 'https://api-waivecar-dev.cleverbuild.biz/auth/signin',
        signup: 'https://api-waivecar-dev.cleverbuild.biz/auth/signup',
        forgot: 'https://api-waivecar-dev.cleverbuild.biz/auth/forgot-password',
        reset: 'https://api-waivecar-dev.cleverbuild.biz/auth/reset-password'
      },
      web: 'https://web-waivecar-dev.cleverbuild.biz',
      admin: 'https://admin-waivecar-dev.cleverbuild.biz',
      assets: '',
      vehicles:{
        getNearby:apiUri+'/vehicles/'
      }
    },
    satellizer: {
      facebook: {
        clientId: '783941098370564',
        url: 'https://api-waivecar-dev.cleverbuild.biz/auth/facebook'
      }
    }
  };
}

angular.module('app')
.factory('config', [
  Config
]);
