'use strict';

import { relay } from 'reach-react';

// ### Resource Reducer

let defaultState = {
  car : null
};

relay.resource('booking', function (state = defaultState, action) {
  switch (action.type) {
    case 'reset':
      return defaultState;
    case 'update':
      return {
        ...defaultState,
        ...action.data
      };
    default:
      return state;
  }
});