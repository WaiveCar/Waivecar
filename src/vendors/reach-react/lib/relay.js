'use strict';

import config from 'config';
import io     from 'socket.io-client';

/**
 * @class Relay
 */
let Relay = module.exports = {};

/**
 * @property states
 * @type     Object
 */
Relay.states = {};

/**
 * @property reducers
 * @type     Object
 */
Relay.reducers = {};

/**
 * @property listeners
 * @type     Object
 */
Relay.listeners = {};

/**
 * @method store
 * @param  {String}   id
 * @param  {Function} reducer
 */
Relay.store = function (id, reducer) {
  this.states[id]    = reducer(undefined, {});
  this.reducers[id]  = reducer;
  this.listeners[id] = {};
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
 * @param  {String} id
 * @param  {Object} action
 */
Relay.dispatch = function (id, action) {
  if (!this.reducers[id]) {
    throw new Error(`Reach Relay > You cannot dispatch reducer ${ id } as it has not been exist.`);
  }

  let reducer   = this.reducers[id];
  let listeners = this.listeners[id];

  // ### Update State

  this.states[id] = reducer(this.states[id], action);

  // ### Inform Listeners

  for (let key in listeners) {
    listeners[key].forEach(listener => { listener() });
  }
};

/**
 * @private
 * @method addListener
 * @param  {Component} component
 * @param  {String}    id
 */
function addListener(component, id) {
  if (!this.states[id]) {
    throw new Error(`Reach Relay > You cannot subscribe to '${ id }' as it has not been defined.`)
  }
  let name = component.constructor.name;
  if (!this.listeners[id][name]) {
    this.listeners[id][name] = [];
  }
  this.listeners[id][name].push(() => {
    component.setState(prepareState(id, this.states[id]));
  });
  component.state[id] = this.states[id];
}

/**
 * @private
 * @method removeListener
 * @param  {String} id   The identifier of the reducer
 * @param  {String} name The constructor name of the component
 */
function removeListener(id, name) {
  if (!this.states[id]) {
    throw new Error(`Reach Relay > You cannot unsubscribe to '${ id }' as it has not been defined.`)
  }
  if (this.listeners[id][name]) {
    delete this.listeners[id][name];
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