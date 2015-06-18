angular.module('app.services').factory('$config', [
  function () {
    'use strict';

    return {
      uri: {
        api: 'http://localhost:3000/v1',
        auth: {
          signin: 'http://localhost:3000/auth/signin',
          signup: 'http://localhost:3000/auth/signup',
          forgot: 'http://localhost:3000/auth/forgot-password',
          reset: 'http://localhost:3000/auth/reset-password'
        },
        web: 'http://localhost',
        admin: 'http://localhost',
        assets: ''
      },
      satellizer: {
        facebook: {
          clientId: '783941098370564',
          url: 'http://localhost:3000/auth/facebook'
        }
      },
      models: {
        users: {
          "singular": "user",
          "plural": "users",
          "route": "/users",
          "list": {
            "display": {
              "create": { "template": "/templates/users/create-modal.html", "isModal": true },
              "show": { "state": "users-show", "isModal": false },
              "edit": { "template": "/templates/users/edit-modal.html", "isModal": true },
              "destroy": true
            },
            "columns": [
              { "name": "id", "displayName": "Id", "formatter": "raw", "isSortable": true, "isFilterable": false, "isVisible": false },
              { "name": "email", "displayName": "Email", "formatter": "raw", "isSortable": true, "isFilterable": true, "isVisible": true },
              { "name": "firstName", "displayName": "First Name", "formatter": "raw", "isSortable": true, "isFilterable": true, "isVisible": true },
              { "name": "lastName", "displayName": "Last Name", "formatter": "raw", "isSortable": true, "isFilterable": true, "isVisible": true },
              { "name": "phoneCountryCode", "displayName": "Prefix", "formatter": "raw", "isSortable": false, "isFilterable": true, "isVisible": true },
              { "name": "phoneNumber", "displayName": "Phone", "formatter": "raw", "isSortable": false, "isFilterable": true, "isVisible": true },
              { "name": "role", "displayName": "Role", "formatter": "title", "isSortable": true, "isFilterable": true, "isVisible": true },
              { "name": "state", "displayName": "State", "formatter": "title", "isSortable": true, "isFilterable": true, "isVisible": true },
              { "name": "createdAt", "displayName": "Created", "formatter": "date", "isSortable": true, "isFilterable": false, "isVisible": true },
              { "name": "updatedAt", "displayName": "Last Updated", "formatter": "date", "isSortable": true, "isFilterable": false, "isVisible": true }
            ]
          }
        }
      }
    };
  }
]);