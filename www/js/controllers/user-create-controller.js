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
  this.user = new $data.resources.users();

  this.submit = function(form){
    var phone = this.user.phone ? this.user.phone.toString() : '';
    var first = phone[0];
    phone = phone.replace(/\D/g, '');
    this.user.phone = first === '+' ? '+' + phone : phone;

    if (this.user.fullName){
      var arr = this.user.fullName.split(' ');
      this.user.firstName = arr[0];
      this.user.lastName = arr[1];
    }

    if (form.$invalid){
      return $message.error('Please fix form errors and try again.');
    } else if (!this.user.firstName || !this.user.lastName){
      return $message.error('Field "Full Name" has to include a space.');
    } else if (this.user.phone.length !== 10){
      return $message.error('Field "Phone" should have 10 numbers.');
    }

    var credentials = {
      identifier: this.user.email,
      password: this.user.password
    };

    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    return this.user.$save()
      .then(function login () {
        this.user.fullName = this.user.firstName + ' ' + this.user.lastName;
        return $auth.login(credentials);
      }.bind(this))
      .then(function () {
        $ionicLoading.hide();
        return $state.go('auth-account-verify', { step: 2 });
      })
      .catch(function (err) {
        $ionicLoading.hide();
        $message.error(err);
      });
  };


  this.registerWithFacebook = function(){
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
  };


  this.enterPhone = function(event){
    if (event.keyCode !== 8) {
      var phone = this.user.phone ? this.user.phone.toString() : '';
      var first = phone[0];
      phone = phone.replace(/\D/g, '');
      if (first === '+') {
        phone = '+' + phone;
        if (phone.length > 13) {
          phone = phone.substr(0, 13);
        }
      } else if (first) {
        phone = '(' + phone;
        if (phone.length >= 4) {
          phone = phone.substr(0, 4) + ') ' + phone.substr(4);
        }
        if (phone.length >= 9) {
          phone = phone.substr(0, 9) + '-' + phone.substr(9);
        }
        if (phone.length > 14) {
          phone = phone.substr(0, 14);
        }
      }
      this.user.phone = phone;
    }
  };
}

module.exports = angular.module('app.controllers')
  .controller('UserCreateController', [
    '$injector',
    UserCreateController
  ]);
