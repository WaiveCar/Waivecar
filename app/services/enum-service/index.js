var _ = require('lodash');

module.exports = function() {

  var methods = {

    getMediaTypes: function() {
      return [
        { name: 'image', description: 'image', icon: 'ico-image' },
        { name: 'document', description: 'office document', icon: 'ico-document' },
        { name: 'video', description: 'video', icon: 'ico-video' },
        { name: 'unknown', description: 'unknown', icon: 'ico-unknown' }
      ];
    },

    getStateTypes: function() {
      return [
        { name: 'active', description: 'Active', icon: 'ico-active' },
        { name: 'disabled', description: 'Disabled', icon: 'ico-disabled' }
      ];
    },

    getAuthTypes: function() {
      return [
        { name: 'password', description: 'Password', icon: 'ico-padlock-closed', isSecure: true },
        { name: 'email', description: 'Email Only', icon: 'ico-padlock-open', isSecure: false },
        { name: 'none', description: 'Public', icon: 'ico-padlock-open', isSecure: false }
      ];
    },

    getPermissionTypes: function() {
      return [
        { name: 'can-create', description: 'Can Create *' },
        { name: 'can-read', description: 'Can Read *' },
        { name: 'can-update', description: 'Can Update *' },
        { name: 'can-delete', description: 'Can Delete *' },
      ];
    }

  };

  return methods;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [];
