'use strict';

import React    from 'react';
import Snackbar from './snackbar';

/**
 * @class SnackbarService
 */
let SnackbarService = module.exports = {};

/**
 * The hooked component where notifications are rendered.
 * @property component
 * @type     Component
 * @default  null
 */
SnackbarService.component = null;

/**
 * @property timer
 * @type     Timeout
 * @default  null
 */
SnackbarService.timer = null;

/**
 * Hook snackbar onto the provided component.
 * @method hook
 * @param  {Component} component
 */
SnackbarService.hook = function (component) {
  SnackbarService.component = component;
};

/**
 * @method notify
 * @param  {String} snack The notification object
 */
SnackbarService.notify = function (snack) {
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
 * Clears the timeout and removed the notification.
 * @method dismiss
 */
SnackbarService.dismiss = function () {
  clearTimeout(this.timer);
  this.slideOut();
}

/**
 * @method slideIn
 * @param  {String} snack The notification object
 */
SnackbarService.slideIn = function (snack) {
  this.component.setState({
    snackbar : {
      ...snack,
      animation : 'fadeInUp'
    }
  });
  if (snack.persist !== true) {
    this.timer = setTimeout(function () {
      this.slideOut();
    }.bind(this), 5000);
  }
}

/**
 * @method slideOut
 * @param  {Function} done
 */
SnackbarService.slideOut = function (done) {
  this.component.setState({
    snackbar : {
      ...this.component.state.snackbar,
      animation : 'fadeOutDown'
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
SnackbarService.render = function () {
  let snack = this.component.state.snackbar;
  return (
    <Snackbar 
      type      = { snack.type }
      message   = { snack.message }
      action    = { snack.action }
      animation = { snack.animation }
    />
  );
};