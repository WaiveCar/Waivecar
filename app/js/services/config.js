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
          "list": {
            "display": {
              "create": {
                "template": "/templates/blacklisted-emails/create-modal.html",
                "isModal": true
              },
              "show": false,
              "edit": {
                "template": "/templates/blacklisted-emails/edit-modal.html",
                "isModal": true
              },
              "destroy": true
            },
            "columns": [
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
        },
        "media": {
          "singular": "media",
          "plural": "media",
          "route": "/media",
          "list": {
            "display": {
              "create": false,
              "show": false,
              "edit": false,
              "destroy": false
            },
            "columns": [
              {
                "name": "id",
                "displayName": "Id",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": false
              },
              {
                "name": "filename",
                "displayName": "Filename",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": true,
                "isVisible": true
              },
              {
                "name": "location",
                "displayName": "Location",
                "formatter": "raw",
                "isSortable": false,
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
          }
        },
        "migrations": {
          "singular": "migration",
          "plural": "migrations",
          "route": "/migrations",
          "list": {
            "display": {
              "create": false,
              "show": false,
              "edit": false,
              "destroy": false
            },
            "columns": [
              {
                "name": "id",
                "displayName": "Id",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": false
              },
              {
                "name": "name",
                "displayName": "Name",
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
        },
        "bookings": {
          "singular": "booking",
          "plural": "bookings",
          "route": "/bookings",
          "list": {
            "display": {
              "create": false,
              "show": false,
              "edit": {
                "template": "/templates/bookings/edit-modal.html",
                "isModal": true
              },
              "destroy": true
            },
            "columns": [
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
                "name": "startAt",
                "displayName": "Start",
                "formatter": "date",
                "isSortable": true,
                "isFilterable": true,
                "isVisible": true
              },
              {
                "name": "endAt",
                "displayName": "Start",
                "formatter": "date",
                "isSortable": true,
                "isFilterable": true,
                "isVisible": true
              },
              {
                "name": "locationStartDescription",
                "displayName": "Start Place",
                "formatter": "raw",
                "isSortable": false,
                "isFilterable": true,
                "isVisible": true
              },
              {
                "name": "locationStartGps",
                "displayName": "Start Location",
                "formatter": "raw",
                "isSortable": false,
                "isFilterable": true,
                "isVisible": true
              },
              {
                "name": "locationEndDescription",
                "displayName": "End Place",
                "formatter": "raw",
                "isSortable": false,
                "isFilterable": true,
                "isVisible": true
              },
              {
                "name": "locationEndGps",
                "displayName": "End Location",
                "formatter": "raw",
                "isSortable": false,
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
        },
        "roles": {
          "singular": "roles",
          "plural": "role",
          "route": "/roles",
          "list": {
            "display": {
              "create": false,
              "show": false,
              "edit": false,
              "destroy": false
            },
            "columns": []
          }
        },
        "settings": {
          "singular": "settings",
          "plural": "setting",
          "route": "/settings",
          "list": {
            "display": {
              "create": false,
              "show": false,
              "edit": {
                "template": "/templates/settings/edit-modal.html",
                "isModal": true
              },
              "destroy": false
            },
            "columns": [
              {
                "name": "id",
                "displayName": "Id",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": false
              },
              {
                "name": "name",
                "displayName": "Name",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": true,
                "isVisible": true
              },
              {
                "name": "value",
                "displayName": "Value",
                "formatter": "raw",
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
        },
        "users": {
          "singular": "user",
          "plural": "users",
          "route": "/users",
          "list": {
            "display": {
              "create": {
                "template": "/templates/users/create-modal.html",
                "isModal": true
              },
              "show": {
                "state": "users-show",
                "isModal": false
              },
              "edit": {
                "template": "/templates/users/edit-modal.html",
                "isModal": true
              },
              "destroy": true
            },
            "columns": [
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
                "formatter": "title",
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
        },
        "vehicles": {
          "singular": "vehicle",
          "plural": "vehicles",
          "route": "/vehicles",
          "list": {
            "display": {
              "create": false,
              "show": {
                "template": "/templates/vehicles/show.html",
                "isModal": false
              },
              "edit": {
                "template": "/templates/vehicles/edit-modal.html",
                "isModal": true
              },
              "destroy": false
            },
            "columns": [
              {
                "name": "id",
                "displayName": "Id",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": false
              },
              {
                "name": "vin",
                "displayName": "VIN",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": true
              },
              {
                "name": "make",
                "displayName": "Make",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": true
              },
              {
                "name": "manufacturer",
                "displayName": "Manufacturer",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": true
              },
              {
                "name": "model",
                "displayName": "Model",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": true
              },
              {
                "name": "year",
                "displayName": "Year",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": true
              },
              {
                "name": "onstarStatus",
                "displayName": "State",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": true
              },
              {
                "name": "phone",
                "displayName": "Phone",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": true
              },
              {
                "name": "primaryDriverId",
                "displayName": "DriverId",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": false
              },
              {
                "name": "primaryDriverURL",
                "displayName": "DriverUrl",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": false
              },
              {
                "name": "unitType",
                "displayName": "Unit",
                "formatter": "raw",
                "isSortable": true,
                "isFilterable": false,
                "isVisible": false
              },
              {
                "name": "url",
                "displayName": "Url",
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
          }
        }
      }
    }
  }
]);
