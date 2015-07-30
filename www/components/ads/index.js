function AdsController($rootScope,$scope,$state,$timeout){
    this.$state=$state;
    this.handleStateValidity();
    var self=this;
    var timeOutFn=function(){
        self.goToRedirectUrl();
    }
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
        if(toState.name=='ads'){
            $timeout(timeOutFn,2000);
        }
    });
     $timeout(timeOutFn,2000);
}
//Redirect if the redirect url is not valid

AdsController.prototype.handleStateValidity = function() {
    var redirectUrl=this.$state.params.redirectUrl;
    if(redirectUrl==null){
        this.goBackToState();
    }
};
AdsController.prototype.goBackToState = function() {
    this.$state.go('cars');
};
AdsController.prototype.goToRedirectUrl = function() {
    var redirectUrl=this.$state.params.redirectUrl;
    var redirectParams=this.$state.params.redirectParams;
    this.$state.go(redirectUrl,redirectParams);
};
function advertisementDirective($state,$timeout){

    return {
        templateUrl: 'components/ads/templates/directives/advertisement.html',
        controller:'AdsController',
        controllerAs:'ads'
    }
}
angular.module('ads',[])
.directive('advertisement', [
    '$state',
    advertisementDirective
])
.controller('AdsController', [
    '$rootScope',
    '$scope',
    '$state',
    '$timeout',
    AdsController
]);