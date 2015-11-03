import { relay } from 'bento';

// ### Resource Reducer

let defaultState = {
  title       : 'No Title',
  description : 'No description added yet...',
  classes     : {
    view      : null,
    container : 'container-fluid'
  }
};

relay.resource('app', function (state = defaultState, action) {
  switch (action.type) {
    case 'update':
      return {
        ...defaultState,
        ...action.data
      };
    default:
      return state;
  }
});

// ### Resource Actions

relay.actions('app', {
  update : (data) => {
    relay.dispatch('app', {
      type : 'update',
      data : data
    });
  }
});
