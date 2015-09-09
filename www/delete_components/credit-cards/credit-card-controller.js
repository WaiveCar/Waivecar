function CreditCardController($rootScope, $scope, $state, DataService) {
  var self         = this;
  self.$state      = $state;
  self.DataService = DataService;
  self.active      = DataService.active;
  self.forms       = {
    new  : {
      firstName : 'Matt',
      lastName  : 'Ginty',
      number    : "5555555555554444",
      cvc       : "237",
      exp_month : 8,
      exp_year  : 2016
    },
    edit : DataService.active.users
  };
}

CreditCardController.prototype.create = function() {
  var self           = this;
  var redirectUrl    = self.$state.params.redirectUrl;
  var redirectParams = self.$state.params.redirectParams;

  self.DataService.createCreditCard(self.forms.new, function(err, data) {
    if (err) console.log(err);
    if (redirectUrl) {
      self.$state.go(redirectUrl, redirectParams);
    } else {
      self.$state.go('users-show', { id: self.active.users.id });
    }
  });
}

CreditCardController.prototype.remove = function() {
  var self           = this;
  var redirectUrl    = self.$state.params.redirectUrl;
  var redirectParams = self.$state.params.redirectParams;

  self.DataService.removeCreditCard(self.forms.new, function(err, data) {
    if (err) console.log(err);
    if (redirectUrl) {
      self.$state.go(redirectUrl, redirectParams);
    } else {
      self.$state.go('users-show', { id: self.active.users.id });
    }
  });
}

angular.module('app')
.controller('CreditCardController', [
  '$rootScope',
  '$scope',
  '$state',
  'DataService',
  CreditCardController
]);