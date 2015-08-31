'use strict';

import React    from 'react';
import Snackbar from './snackbar';

/**
 * @class Handler
 */
let Handler = module.exports = {};

/**
 * The hooked component where notifications are rendered.
 * @property component
 * @type     Component
 * @default  null
 */
Handler.component = null;

/**
 * @property timer
 * @type     Timeout
 * @default  null
 */
Handler.timer = null;

/**
 * Hook snackbar onto the provided component.
 * @method hook
 */
Handler.hook = function (component) {
  Handler.component = component;
};

/**
 * @method notify
 * @param  {String} message
 */
Handler.notify = function (message) {
  clearTimeout(this.timer);
  if (this.component.state.snackbar) {
    this.slideOut(function () {
      this.slideIn(message);
    }.bind(this));
  } else {
    this.slideIn(message);
  }
};

/**
 * @method slideIn
 * @param  {String} message
 */
Handler.slideIn = function (message) {
  this.component.setState({
    snackbar : {
      message   : message,
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
Handler.slideOut = function (done) {
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
Handler.render = function () {
  let snack = this.component.state.snackbar;
  return (
    <Snackbar 
      message   = { snack.message }
      animation = { snack.animation }
    />
  );
};