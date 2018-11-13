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

  this.inLocationChanged = function (setting) {
    if(setting === 'la' || setting === 'notla') {
      setting = (setting === 'la');
      this.inLA = setting;
      this.inNotLA = !setting;
      this.havePromo = false;
    } else {
      this.inLA = false;
      this.inNotLA = false;
      this.havePromo = true;
    }
    this.isLocationSelected = true;
  };

  this.submit = function(form){
    this.user.phone = this.user.phone ? this.user.phone.toString() : '';

    if (this.user.fullName){
      var arr = this.user.fullName.split(' ');
      this.user.lastName = arr.pop();
      this.user.firstName = arr.join(' ');
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


    var opts = {
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      phone: this.user.phone,
      password: this.user.password
    }, nextPage;

    if (this.inLA) {
      opts.longitude = -118.4912;
      opts.latitude = 34.0195;
      opts.placeName = "Los Angeles";
      nextPage = 'user-waitlist';
    } else if(!this.havePromo) {
      opts.placeName = this.placeName;
      nextPage = 'sunny-santa-monica';
    } else if(this.havePromo) {
      opts.promoCode = this.user.promoCode;
      opts.account = this.user.account;
    }

    this.user.fullName = this.user.firstName + ' ' + this.user.lastName;
    // we always add a user to the waitlist and then
    // the server code sees if the user can be fast-tracked
    // or not.
    return $data.resources.User.addToWaitlist(opts).$promise
      .then(function (res) {
        $ionicLoading.hide();
        // here's the thing ... if res.fastTrack is true then
        // this means the person is good to go and we can go
        // to the next page. Magical, right?

        if(res.fastTrack) {
          return $auth.login(credentials).then(function() {

            return $state.go('auth-account-verify', { step: 2 });
          });
        } 
        if (res.isCsula) {
          nextPage = 'user-waitlist';  
        }
        return $state.go(nextPage);
      })
      .catch(function (err) {
        $ionicLoading.hide();
        $message.error(err);
      });
      /*
    } else {
      return this.user.$save()
        .then(function login (user) {
          if(!mthis.user) {
            mthis.user = user;
          }
          mthis.user.fullName = user.firstName + ' ' + user.lastName;
          return $auth.login(credentials);
        }).then(function () {
          $ionicLoading.hide();
          $auth.logout();
          return $state.go('user-waitlist');
        }).catch(function (err) {
          $ionicLoading.hide();
          $message.error(err);
        });
    } 
        */
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
