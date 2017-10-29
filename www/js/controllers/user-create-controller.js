'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');

function UserCreateController($injector){
  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var $message = $injector.get('$message');
  var $ionicLoading = $injector.get('$ionicLoading');
  var $modal = $injector.get('$modal');
  this.user = new $data.resources.users();

  this.inLA = false;
  this.inNotLA = false;
  this.placeName = '';

  this.inLocationChanged = function (isInLA) {
    this.inLA = isInLA;
    this.inNotLA = !isInLA;
    this.isLocationSelected = true;
  };

  this.submit = function(form){
    this.user.phone = this.user.phone ? this.user.phone.toString() : '';

    if (this.user.fullName){
      var arr = this.user.fullName.split(' ');
      this.user.firstName = arr[0];
      this.user.lastName = arr[1];
    }

    var phone = this.user.phone.replace(/[\s()\-+]/g, '');

    if (form.$invalid){
      return $message.error('Please fix form errors and try again.');
    } else if(!phone.match(/^1?[2-9]\d{9}$/)){
      return $message.error('Thanks but we only accept United States numbers currently. Please check the digits and correct any issues.');
    } else if (!this.user.firstName || !this.user.lastName){
      return $message.error('Field "Full Name" has to include a space.');
    }

    if (phone.length === 10) {
      phone = '1' + phone;
    }
    phone = '+' + phone;
    this.user.phone = phone;

    var credentials = {
      identifier: this.user.email,
      password: this.user.password
    };

    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });


    if (this.inLA) {
      var mthis = this;
      return this.user.$save()
        .then(function login (user) {
          if(!mthis.user) {
            mthis.user = user;
          }
          mthis.user.fullName = user.firstName + ' ' + user.lastName;
          return $auth.login(credentials);
        }).then(function () {
          $ionicLoading.hide();
          return $state.go('auth-account-verify', {step: 2});
        }).catch(function (err) {
          $ionicLoading.hide();
          $message.error(err);
        });
    } else {
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
    }
  };


  this.registerWithFacebook = function(){

    var modal;

    return $modal('result', {
      icon: 'waivecar-icon',

      message: 'Our WaiveCars live in Santa Monica California.   <br/>  Do you want to continue?',
      actions: [{
        className: 'button-balanced',
        text: 'Yes',
        handler: function () {
          modal.remove();
          return $auth.facebookAuth()
            .then(function (res) {
              if (res.code === 'NEW_USER') {
                return $state.go('users-new-facebook', {
                  step: 2
                });
              } else if (res.code === 'LOGGED_IN') {
                return $state.go('cars');
              }
            })
            .catch(function (err) {
              $message.error(err);
            });
        }
      },{
        className: 'button-dark',
        text: 'No',
        handler: function () {
          modal.remove();
          return $state.go('users-add-to-waitlist');
        }
      }]
    }).then(function (_modal) {
      modal = _modal;
      modal.show();
    });


  };

}

module.exports = angular.module('app.controllers')
  .controller('UserCreateController', [
    '$injector',
    UserCreateController
  ]);
