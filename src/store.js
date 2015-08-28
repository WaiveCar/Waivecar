'use strict';

import config from 'config';
import io     from 'socket.io-client';
import { 
  createStore, 
  combineReducers 
} from 'redux';

// ### Reducers

let reducers = {};
[
  require('interface/reducers'),    // Interface reducers
  require('modules/redux/reducers') // Sample reducers
].forEach(function (reducerList) {
  for (let key in reducerList) {
    reducers[key] = reducerList[key];
  }
});

// ### Store

let store = createStore(combineReducers(reducers), undefined); // Second param later would be window.STATE_FROM_SERVER when doing isomorphic setups

// ### Socket

if (config.api.socket) {
  connect(config.api.socket);
}

/**
 * Initiates socket and starts listening for redux actions to dispatch
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

  socket.on('redux', function (payload) {
    store.dispatch(payload);
  });
}

// ### Export

export default store;