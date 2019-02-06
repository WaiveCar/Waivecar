/* global ProgressIndicator */
'use strict';
var angular = require('angular');
var ionic = require('ionic');

function $progress () {
  return {
    show: function (_message) {
      var message = _message || 'Please wait...';
      if (!ionic.Platform.isWebView()) {
        console.log('showing loader ', _message);
        return null;
      }
      return ProgressIndicator.show(message);
    },

    showSimple: function (_dim) {
      if (!ionic.Platform.isWebView()) {
        console.log('showing loader');
        return null;
      }
      var dim = _dim || false;
      return ProgressIndicator.showSimple(dim);
    },

    showSimpleWithLabel: function (_dim, _label) {
      var dim = _dim || false;
      var label = _label || 'Loading...';
      return ProgressIndicator.showSimpleWithLabel(dim, label);
    },

    showSimpleWithLabelDetail: function (_dim, _label, _detail) {
      var dim = _dim || false;
      var label = _label || 'Loading...';
      var detail = _detail || 'Please wait';
      return ProgressIndicator.showSimpleWithLabelDetail(dim, label, detail);
    },

    showDeterminate: function (_dim, _timeout) {
      var dim = _dim || false;
      var timeout = _timeout || 50000;
      return ProgressIndicator.showDeterminate(dim, timeout);
    },

    showDeterminateWithLabel: function (_dim, _timeout, _label) {
      var dim = _dim || false;
      var timeout = _timeout || 50000;
      var label = _label || 'Loading...';

      return ProgressIndicator.showDeterminateWithLabel(dim, timeout, label);
    },

    showAnnular: function (_dim, _timeout) {
      var dim = _dim || false;
      var timeout = _timeout || 50000;
      return ProgressIndicator.showAnnular(dim, timeout);
    },

    showAnnularWithLabel: function (_dim, _timeout, _label) {
      var dim = _dim || false;
      var timeout = _timeout || 50000;
      var label = _label || 'Loading...';
      return ProgressIndicator.showAnnularWithLabel(dim, timeout, label);
    },

    showBar: function (_dim, _timeout) {
      var dim = _dim || false;
      var timeout = _timeout || 50000;
      return ProgressIndicator.showBar(dim, timeout);
    },

    showBarWithLabel: function (_dim, _timeout, _label) {
      var dim = _dim || false;
      var timeout = _timeout || 50000;
      var label = _label || 'Loading...';
      return ProgressIndicator.showBarWithLabel(dim, timeout, label);
    },

    showSuccess: function (_dim, _label) {
      var dim = _dim || false;
      var label = _label || 'Success';
      return ProgressIndicator.showSuccess(dim, label);
    },

    showText: function (_dim, _text, _position) {
      var dim = _dim || false;
      var text = _text || 'Warning';
      var position = _position || 'center';
      return ProgressIndicator.showText(dim, text, position);
    },

    hide: function () {
      if (!ionic.Platform.isWebView()) {
        console.log('hiding loader');
        return null;
      }
      return ProgressIndicator.hide();
    }
  };
}

angular.module('app.services').factory('$progress', [
  $progress
]);