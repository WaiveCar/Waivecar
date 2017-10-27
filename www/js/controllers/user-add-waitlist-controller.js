'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');

function UserAddWaitlistController($injector){
  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var $message = $injector.get('$message');
  var $ionicLoading = $injector.get('$ionicLoading');

  this.user = {
    fullName : '',
    email : ''
  };

  this.placeName = '';


  this.submit = function(form){

    if (this.user.fullName){
      var arr = this.user.fullName.split(' ');
      this.user.firstName = arr[0];
      this.user.lastName = arr[1];
    }

    if (form.$invalid){
      return $message.error('Please fix form errors and try again.');
    } else if (!this.user.firstName || !this.user.lastName){
      return $message.error('Field "Full Name" has to include a space.');
    }


    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });



    return $data.resources.User.addToWaitlist({
        firstName:this.user.firstName,
        lastName:this.user.lastName,
        email:this.user.email,
        placeName:this.placeName
      }).$promise
      .then(function () {
        $ionicLoading.hide();
        return $state.go('sunny-santa-monica');
      })
      .catch(function (err) {
        $ionicLoading.hide();
        $message.error(err);
      });

  };
}

module.exports = angular.module('app.controllers')
  .controller('UserAddWaitlistController', [
    '$injector',
    UserAddWaitlistController
  ]);
