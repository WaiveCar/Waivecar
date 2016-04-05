import React       from 'react';
import { relay }   from 'bento';
import Component   from './snackbar';
import { update }  from './actions';
import './reducer';

/**
 * @class Snackbar
 */
let Snackbar = module.exports = {};

/**
 * @property timer
 * @type     Timeout
 * @default  null
 */
Snackbar.timer = null;

/**
 * @method notify
 * @param  {String} notification The notification object
 */
Snackbar.notify = function (notification) {
  let { active } = relay.getState('snackbar');

  // ### Timer
  // We need to reset the timer since this is a new notification.

  clearTimeout(this.timer);

  // ### Action
  // Bind snackbar to the click method of the action.

  if (notification.action) {
    notification.action.click = notification.action.click.bind(this);
  }

  // ### Present
  // Present the new notification.

  if (active) {
    this.slideOut(function () {
      this.slideIn(notification);
    }.bind(this));
  } else {
    this.slideIn(notification);
  }
};

/**
 * Clears the timeout and removed the notification.
 * @method dismiss
 */
Snackbar.dismiss = function () {
  let { active } = relay.getState('snackbar');

  // ### Timer
  // We need to reset the timer since this is a new notification.

  clearTimeout(this.timer);

  // ### Dismiss
  // Dismiss the notification if its currently in an active state.

  if (active) {
    this.slideOut();
  }
}

/**
 * @method slideIn
 * @param  {String} snack The notification object
 */
Snackbar.slideIn = function (notification) {
  relay.dispatch('snackbar', update({
    active    : true,
    animation : 'fadeInUp',
    ...notification
  }));
  if (!notification.persist) {
    this.timer = setTimeout(function () {
      this.slideOut();
    }.bind(this), 5000);
  }
}

/**
 * @method slideOut
 * @param  {Function} done
 */
Snackbar.slideOut = function (done) {
  relay.dispatch('snackbar', update({
    animation : 'fadeOutDown'
  }));

  // ### Reset State
  // Once the fadeOut animation has completed we reset the snackbar
  // state to its default parameters.

  this.timer = setTimeout(function () {
    relay.dispatch('snackbar', update({
      active  : false,
      type    : null,
      message : null,
      persist : false,
      action  : null
    }));
    if (done) {
      done();
    }
  }.bind(this), 500);
}

/**
 * @method render
 * @return {Component}
 */
Snackbar.render = function () {
  return <Component />
};
