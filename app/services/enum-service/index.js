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

    getMediaStateTypes: function() {
      return [
        { name: 'not-started', description: 'Not Started', icon: 'ico-pending', progress: 0 },
        { name: 'uploading', description: 'The file is being uploaded', icon: 'ico-pending', progress: 10 },
        { name: 'children-pending', description: 'Media Children are processing', icon: 'ico-pending', progress: 70, service: 'finalize-parent-media' },
        { name: 'extracting', description: 'The file is being processed', icon: 'ico-pending', progress: 70, service: 'extract-media' },
        { name: 'analyzing', description: 'The file is being processed', icon: 'ico-active', progress: 80, service: 'analyze-media' },
        { name: 'manual-pending', description: 'Manual processing required', icon: 'ico-pending', progress: 80 },
        { name: 'validating', description: 'The file is being processed', icon: 'ico-active', progress: 90, service: 'validate-media' },
        { name: 'completed', description: 'Completed Processing', icon: 'ico-active', progress: 100, service: 'finalize-media' }
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
