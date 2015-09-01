'use strict';

import React    from 'react';
import Snackbar from './snackbar';

/**
 * @class SnackbarHandler
 */
let SnackbarHandler = module.exports = {};

/**
 * The hooked component where notifications are rendered.
 * @property component
 * @type     Component
 * @default  null
 */
SnackbarHandler.component = null;

/**
 * @property timer
 * @type     Timeout
 * @default  null
 */
SnackbarHandler.timer = null;

/**
 * Hook snackbar onto the provided component.
 * @method hook
 * @param  {Component} component
 */
SnackbarHandler.hook = function (component) {
  SnackbarHandler.component = component;
};

/**
 * @method notify
 * @param  {String} snack The notification object
 */
SnackbarHandler.notify = function (snack) {
  clearTimeout(this.timer);
  if (this.component.state.snackbar) {
    this.slideOut(function () {
      this.slideIn(snack);
    }.bind(this));
  } else {
    this.slideIn(snack);
  }
};

/**
 * @method slideIn
 * @param  {String} snack The notification object
 */
SnackbarHandler.slideIn = function (snack) {
  this.component.setState({
    snackbar : {
      ...snack,
      animation : 'slideInUp'
    }
  });
  this.timer = setTimeout(function () {
    this.slideOut();
  }.bind(this), 5000);
}

/**
 * @method slideOut
 * @param  {Function} done
 */
SnackbarHandler.slideOut = function (done) {
  this.component.setState({
    snackbar : {
      ...this.component.state.snackbar,
      animation : 'slideOutDown'
    }
  });
  this.timer = setTimeout(function () {
    this.component.setState({
      snackbar : null
    });
    if (done) { done(); }
  }.bind(this), 500);
}

/**
 * @method render
 */
SnackbarHandler.render = function () {
  let snack = this.component.state.snackbar;
  return (
    <Snackbar 
      message   = { snack.message }
      action    = { snack.action }
      animation = { snack.animation }
    />
  );
};