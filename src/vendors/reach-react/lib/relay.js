'use strict';

import config from 'config';
import io     from 'socket.io-client';

/**
 * @class Relay
 */
let Relay = module.exports = {};

/**
 * The store storing states, reducers, actions and listeners.
 * @property store
 * @type     Object
 */
Relay.store = {
  states    : {},
  reducers  : {},
  actions   : {},
  listeners : {}
};

/**
 * @method resource
 * @param  {String}   resource
 * @param  {Function} reducer
 */
Relay.resource = function (resource, reducer) {
  if (!this.store.reducers[resource]) {
    this.store.states    [resource] = reducer(undefined, {});
    this.store.reducers  [resource] = reducer;
    this.store.listeners [resource] = {};
  }
};

/**
 * Store a list of relay actions.
 * @method actions
 * @param  {Object} actions
 */
Relay.actions = function (actions) {
  Object.assign(this.store.actions, actions);
};

/**
 * @method subscribe
 * @param  {Component} component
 * @param  {String}    id
 */
Relay.subscribe = function (component, id) {
  if (!component.state) {
    component.state = {};
  }
  if (typeof id === 'object') {
    id.forEach(id => {
      addListener.call(this, component, id);
    }.bind(this));
  } else {
    addListener.call(this, component, id);
  }
};

/**
 * @method unsubscribe
 * @param  {Component} component
 * @param  {Mixed}     id
 */
Relay.unsubscribe = function (component, id) {
  let name = component.constructor.name;
  if (typeof id === 'object') {
    id.forEach(id => {
      removeListener.call(this, id, name);
    }.bind(this));
  } else {
    removeListener.call(this, id, name);
  }
};

/**
 * @method dispatch
 * @param  {String} resource
 * @param  {Object} payload
 */
Relay.dispatch = function (resource, payload) {
  if (!this.store.reducers[resource]) {
    return console.log(`'${ resource }' resource has not been defined, ignoring dispatch request.`);
  }

  let reducer   = this.store.reducers[resource];
  let listeners = this.store.listeners[resource];

  // ### Update State

  this.store.states[resource] = reducer(this.store.states[resource], payload);

  // ### Inform Listeners

  for (let key in listeners) {
    listeners[key].forEach(listener => { listener() });
  }
};

/**
 * @method getState
 * @return {Object}
 */
Relay.getState = function () {
  return this.store.states;
};

/**
 * @method getActions
 * @return {Object}
 */
Relay.getActions = function () {
  return this.store.actions;
};

/**
 * @private
 * @method addListener
 * @param  {Component} component
 * @param  {String}    id
 */
function addListener(component, id) {
  if (!this.store.states[id]) {
    return console.log(`'${ id }' state has not been defined, ignoring subscription request.`);
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
 * @method removeListener
 * @param  {String} id   The identifier of the reducer
 * @param  {String} name The constructor name of the component
 */
function removeListener(id, name) {
  if (!this.store.listeners[id] || !this.store.listeners[id][name]) {
    return console.log(`'${ id }.${ name }' listener does not exist, ignoring unsubscribe request.`);
  }
  if (this.store.listeners[id][name]) {
    delete this.store.listeners[id][name];
  }
}

/**
 * @private
 * @method prepareState
 * @param  {String} id
 * @param  {Any}    state
 * @return {Object}
 */
function prepareState(id, state) {
  let result = {};
  result[id] = state;
  return result;
}

// ### Socket

if (config.api.socket) {
  connect(config.api.socket);
}

/**
 * @method connect
 * @param  {Mixed} config
 */
function connect(config) {
  let socket;
  if (typeof config === 'object') {
    if (config.uri && config.options) {
      socket = io(config.uri, config.options);
    } else if (config.uri) {
      socket = io(config.uri);
    }
  } else {
    socket = io(config);
  }
  if (!socket) {
    throw new Error('Socket has not been defined');
  }
  socket.on('relay', function (id, payload) {
    Relay.dispatch(id, payload);
  });
}