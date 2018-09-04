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
    fullName: '',
    email: ''
  };

  this.placeName = '';

  this.goback = function() {
    return $state.go('auth');
  };

  this.submit = function(form){

    if (this.user.fullName){
      var arr = this.user.fullName.split(' ');
      this.user.lastName = arr.pop();
      this.user.firstName = arr.join(' ');
    }

    if (form.$invalid){
      return $message.error('Please fix form errors and try again.');
    } else if (!this.user.firstName || !this.user.lastName){
      return $message.error('Field "Full Name" has to include a space.');
    }


    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    var mthis = this;
    return $data.resources.User.addToWaitlist({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        accountType: 'normal',
        phone: this.user.phone,
        email: this.user.email,
        placeName: this.placeName
      }).$promise
      .then(function () {
        // BUGBUG: this HACK is being used to know where our origin is from
        // If a phone isn't set then we did the facebook flow and after this 
        // is done we should return to the splash.
        $ionicLoading.hide();
        var opts = {};
        if(!mthis.user.phone) {
          opts.brief = true;
        }

        return $state.go('sunny-santa-monica', opts);
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
