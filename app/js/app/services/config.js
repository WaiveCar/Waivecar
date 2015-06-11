angular.module('app.services').factory('$config', [
  function() {
    return {
      "uri": {
        "api": "http://localhost:3000/v1",
        "auth": {
          "signin": "http://localhost:3000/auth/signin",
          "signup": "http://localhost:3000/auth/signup",
          "signout": "",
          "forgot": "http://localhost:3000/auth/forgot-password",
          "reset": "http://localhost:3000/auth/reset-password"
        },
        "web": "http://localhost:3080",
        "admin": "http://localhost:3081",
        "assets": ""
      },
      "models": {
        "blacklisted-emails": {
          "singular": "blacklistedEmail",
          "plural": "blacklistedEmails",
          "route": "/blacklisted-emails",
          "fields": [
            {
              "name": "id",
              "displayName": "Id",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": false
            },
            {
              "name": "email",
              "displayName": "Email",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "firstName",
              "displayName": "First Name",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "lastName",
              "displayName": "Last Name",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "phoneCountryCode",
              "displayName": "Prefix",
              "formatter": "raw",
              "isSortable": false,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "phoneNumber",
              "displayName": "Phone",
              "formatter": "raw",
              "isSortable": false,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "role",
              "displayName": "Role",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "state",
              "displayName": "State",
              "formatter": "title",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "createdAt",
              "displayName": "Created",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            },
            {
              "name": "updatedAt",
              "displayName": "Last Updated",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            }
          ]
        },
        "media": {
          "singular": "media",
          "plural": "media",
          "route": "/media",
          "fields": [
            {
              "name": "id",
              "displayName": "Id",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": false
            },
            {
              "name": "state",
              "displayName": "State",
              "formatter": "title",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "createdAt",
              "displayName": "Created",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            },
            {
              "name": "updatedAt",
              "displayName": "Last Updated",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            }
          ]
        },
        "migrations": {
          "singular": "migration",
          "plural": "migrations",
          "route": "/migrations",
          "fields": [
            {
              "name": "id",
              "displayName": "Id",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": false
            },
            {
              "name": "createdAt",
              "displayName": "Created",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            },
            {
              "name": "updatedAt",
              "displayName": "Last Updated",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            }
          ]
        },
        "rentals": {
          "singular": "rental",
          "plural": "rentals",
          "route": "/rentals",
          "fields": [
            {
              "name": "id",
              "displayName": "Id",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": false
            },
            {
              "name": "state",
              "displayName": "State",
              "formatter": "title",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "createdAt",
              "displayName": "Created",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            },
            {
              "name": "updatedAt",
              "displayName": "Last Updated",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            }
          ]
        },
        "roles": {
          "singular": "roles",
          "plural": "role",
          "route": "/roles"
        },
        "settings": {
          "singular": "settings",
          "plural": "setting",
          "route": "/settings",
          "fields": [
            {
              "name": "id",
              "displayName": "Id",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": false
            },
            {
              "name": "createdAt",
              "displayName": "Created",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            },
            {
              "name": "updatedAt",
              "displayName": "Last Updated",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            }
          ]
        },
        "users": {
          "singular": "user",
          "plural": "users",
          "route": "/users",
          "fields": [
            {
              "name": "id",
              "displayName": "Id",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": false
            },
            {
              "name": "email",
              "displayName": "Email",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "firstName",
              "displayName": "First Name",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "lastName",
              "displayName": "Last Name",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "phoneCountryCode",
              "displayName": "Prefix",
              "formatter": "raw",
              "isSortable": false,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "phoneNumber",
              "displayName": "Phone",
              "formatter": "raw",
              "isSortable": false,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "role",
              "displayName": "Role",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "state",
              "displayName": "State",
              "formatter": "title",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "createdAt",
              "displayName": "Created",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            },
            {
              "name": "updatedAt",
              "displayName": "Last Updated",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            }
          ]
        },
        "vehicles": {
          "singular": "vehicle",
          "plural": "vehicles",
          "route": "/vehicles",
          "fields": [
            {
              "name": "id",
              "displayName": "Id",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": false
            },
            {
              "name": "make",
              "displayName": "Make",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "model",
              "displayName": "Model",
              "formatter": "raw",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "state",
              "displayName": "State",
              "formatter": "title",
              "isSortable": true,
              "isFilterable": true,
              "isVisible": true
            },
            {
              "name": "createdAt",
              "displayName": "Created",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            },
            {
              "name": "updatedAt",
              "displayName": "Last Updated",
              "formatter": "date",
              "isSortable": true,
              "isFilterable": false,
              "isVisible": true
            }
          ]
        }
      }
    }
  }
]);
