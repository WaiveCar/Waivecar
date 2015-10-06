'use strict';

import { relay } from 'reach-react';

let defaultState = {
  active    : false,
  type      : null,
  message   : null,
  animation : null,
  persist   : false,
  action    : null
};

relay.resource('snackbar', function (state = defaultState, action) {
  switch (action.type) {
    case 'update': 
      return {
        ...state,
        ...action.data
      };
    default:
      return state;
  }
});