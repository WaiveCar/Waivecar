import { relay } from 'bento';

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

// ### Resource Actions

relay.actions('booking', {
  update : (data) => {
    relay.dispatch('booking', {
      type : 'update',
      data : data
    });
  }
});
