'use strict';

import { snackbar } from 'bento-web';

module.exports = class Service {

  /**
   * Handles context, service and default state assignment.
   * @param  {Object} ctx          The component context being tied to the service.
   * @param  {String} service      The name of the service.
   * @param  {Mixed}  defaultState The default state of the service.
   */
  constructor(ctx, service, defaultState) {
    this.ctx                = ctx;
    this.service            = service;
    this.ctx.state[service] = defaultState;
  }

  /**
   * Pushes a success notification via snackbar.
   * @param {String} message
   */
  success(message) {
    snackbar.notify({
      type    : `success`,
      message : message
    });
  }

  /**
   * Throws a snackbar notification error.
   * @param  {String} message
   */
  error(message) {
    snackbar.notify({
      type    : `danger`,
      message : message
    });
  }

  /**
   * Updates a service key state on the context.
   * @param {String} key
   * @param {Mixed}  val
   */
  setState(key, val) {
    let state  = this.ctx.state[this.service];
    state[key] = val;
    this.ctx.setState({
      [this.service] : state
    });
  }

  /**
   * Returns the current value of a service state.
   * @param  {String} key
   * @return {Mixed}
   */
  getState(key) {
    return this.ctx.state[this.service][key];
  }

  /**
   * Returns reference key defined on the component ctx.
   * @param  {String} key
   * @return {Mixed}
   */
  getRefs(key) {
    return this.ctx.refs[key];
  }

}
