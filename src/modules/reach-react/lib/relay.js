'use strict';

import type   from './helpers/type';
import socket from './socket';

class Relay {

  /**
   * Constructs the relay store and initates a relay socket handler.
   */
  constructor() {
    let self = this;

    this.store = {
      states    : {},
      reducers  : {},
      actions   : {},
      listeners : {}
    };

    socket.on('relay', (resource, payload) => {
      self.dispatch(resource, payload);
    });
  }

  // ### Registration Methods
  // A list of methods used when registering reducers and actions.

  /**
   * Registers a new resource with the relay store.
   * @param  {String}   id
   * @param  {Function} reducer
   */
  resource(id, reducer) {
    if (!this.store.reducers[id]) {
      this.store.states[id]    = reducer(undefined, {});
      this.store.reducers[id]  = reducer;
      this.store.listeners[id] = {};
    }
  }

  /**
   * Stores a new set of actions under the provided key.
   * @param  {String} key
   * @param  {Object} actions
   */
  actions(key, actions) {
    this.store.actions[key] = actions;
  }

  // ### Component Methods
  // A list of methods used for utilizing the relay with react components.

  /**
   * Adds the requested reducer state to the provided context state.
   * @param  {Object} context The component context to assign the reducer state to.
   * @param  {Mixed}  id      A single string or an array of strings representing the
   *                          stores to attach to the provided context state.
   */
  subscribe(context, id) {
    if (!context.state) {
      context.state = {};
    }
    if (type.isArray(id)) {
      id.forEach(id => {
        addListener.call(this, context, id);
      }.bind(this));
    } else {
      addListener.call(this, context, id);
    }
  }

  /**
   * Removes any event listeners based on the current context.
   * @param  {Object} context The component context to remove listeners from.
   * @param  {Mixed}  id      A single string or array of states to remove.
   */
  unsubscribe(context, id) {
    let name = context.constructor.name;
    if (type.isArray(id)) {
      id.forEach(id => {
        removeListener.call(this, id, name);
      }.bind(this));
    } else {
      removeListener.call(this, id, name);
    }
  }

  /**
   * Injects a resource with the provided payload.
   * @param  {String} resource
   * @param  {Object} payload
   */
  dispatch(resource, payload) {
    if (!this.store.reducers[resource]) {
      return console.warn(`Relay > Ignoring dispatch request, '${ resource }' reducer has not been defined.`);
    }

    let reducer   = this.store.reducers[resource];
    let listeners = this.store.listeners[resource];

    // ### Update State

    this.store.states[resource] = reducer(this.store.states[resource], payload);

    // ### Inform Listeners

    for (let key in listeners) {
      listeners[key].forEach(listener => { listener() });
    }
  }

  /**
   * Returns the current state of the provided resource.
   * @param  {String} [resource] If no resource is provided we return all states.
   * @return {Any}
   */
  getState(resource) {
    if (resource) {
      return this.store.states[resource];
    }
    return this.store.states;
  }

  /**
   * Returns a list of actions registered for the provided resource.
   * @param  {String} [resource] If no resource is provided we return all actions.
   * @return {Object}
   */
  getActions(resource) {
    if (resource) {
      return this.store.actions[resource];
    }
    return this.store.actions;
  }

}

module.exports = new Relay();

/**
 * @private
 * @param {Component} component
 * @param {String}    id
 */
function addListener(component, id) {
  if (!this.store.states[id]) {
    return console.warn(`Relay > Ignoring subscription request, '${ id }' has not been defined.`);
  }
  let name = component.constructor.name;
  if (!this.store.listeners[id][name]) {
    this.store.listeners[id][name] = [];
  }
  this.store.listeners[id][name].push(() => {
    component.setState(prepareState(id, this.store.states[id]));
  });
  component.state[id] = this.store.states[id];
}

/**
 * @private
 * @param {String} id   The identifier of the reducer
 * @param {String} name The constructor name of the component
 */
function removeListener(id, name) {
  if (!this.store.listeners[id] || !this.store.listeners[id][name]) {
    return console.warn(`Relay > Ignoring unsubscribe request, '${ id }.${ name }' listener has not been defined.`);
  }
  if (this.store.listeners[id][name]) {
    delete this.store.listeners[id][name];
  }
}

/**
 * @private
 * @param  {String} id
 * @param  {Any}    state
 * @return {Object}
 */
function prepareState(id, state) {
  let result = {};
  result[id] = state;
  return result;
}