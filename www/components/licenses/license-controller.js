// Fun Fact: http://grammarist.com/spelling/licence-license/
function LicenseController($rootScope, $scope, $state, DataService,WaiveCarStateService) {
  var self         = this;
  self.$state      = $state;
  self.DataService = DataService;
  self.active      = DataService.active;
  self.WaiveCarStateService=WaiveCarStateService;
  self.forms       = {
    new  : {
      firstName : 'Travis',
      lastName  : 'Kalanick',
      id        : 'B4030477',
      expiry    : 20160120,
      address   : '2570 24th Street Sacramento, CA 95818',
      dob       : 19770831
    },
    edit : self.active.users
  };
}

LicenseController.prototype.create = function() {
  var self           = this;
  var redirectUrl    = self.$state.params.redirectUrl;
  var redirectParams = self.$state.params.redirectParams;
  console.log(this.forms.new);
  // self.DataService.createLicense(self.forms.new, function(err, data) {
  //   if (err) console.log(err);
  //   if (redirectUrl) {
  //     self.$state.go('credit-cards-new', {
  //       redirectUrl    : redirectUrl,
  //       redirectParams : redirectParams
  //     });
  //   } else {
  //     self.WaiveCarStateService.next({id: self.active.users.id});
  //     // self.$state.go('users-show', { id: self.active.users.id });
  //   }
  // });
}

LicenseController.prototype.remove = function() {
  var self           = this;
  var redirectUrl    = self.$state.params.redirectUrl;
  var redirectParams = self.$state.params.redirectParams;

  self.DataService.removeLicense(self.forms.new, function(err, data) {
    if (err) console.log(err);
    if (redirectUrl) {
      self.$state.go(redirectUrl, redirectParams);
    } else {
      self.$state.go('users-show', { id: self.active.users.id });
    }
  });
}

angular.module('app')
.controller('LicenseController', [
  '$rootScope',
  '$scope',
  '$state',
  'DataService',
  'WaiveCarStateService',
  LicenseController
]);