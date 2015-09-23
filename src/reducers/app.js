'use strict';

import { relay } from 'reach-react';

// ### Actions

relay.actions({

  APP_UPDATE: (data) => {
    return {
      type : 'update',
      data : data
    }
  }

});

// ### Resource Reducer

let defaultState = {
  title   : 'No Title',
  classes : {
    view      : null,
    container : 'container-fuid'
  }
};

relay.resource('app', function (state = defaultState, action) {
  switch (action.type) {
    case 'update':
      return Object.assign(defaultState, action.data);
    default:
      return state;
  }
});