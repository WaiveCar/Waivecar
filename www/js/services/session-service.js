angular.module('app.services').factory('$session', [
  '$rootScope',
  '$window',
  function ($rootScope, $window) {

    var session = {

      data: {},

      load: function () {
        try {
          angular.forEach($window.localStorage, function (value, key) {
            session.data[key] = JSON.parse(value);
          });
        } catch (err) {
          $rootScope.$emit('sessionParseError', err);
        }
        return this;
      },

      has: function (key) {
        if (_.isEmpty(this.data)) {
          this.load();
        }
        return undefined === this.data[key] ? false : true;
      },

      get: function (key) {
        if (_.isEmpty(this.data)) {
          this.load();
        }
        return undefined === this.data[key] ? {} : this.data[key];
      },

      set: function (key, value) {
        this.data[key] = value;
        return this;
      },

      save: function () {
        angular.forEach(this.data, function (value, key) {
          $window.localStorage[key] = JSON.stringify(value);
        });

        return this;
      },

      purge: function (key) {
        if (key) {
          delete this.data[key];
          delete $window.localStorage[key];
        } else {
          this.data = {};
          $window.localStorage.clear();
        }

        return this;
      }
    };

    return session.load();
  }
]);
