import { relay } from 'bento';

relay.resource('notes', function (state = defaultState(), action) {
  let map = divine(action.data);
  switch (action.type) {
    case 'index' : {
      if (!map) state = defaultState();
      else state[map.type][map.id] = action.data;
      return state;
    }
    case 'store' : {
      let current = state[map.type][map.id] || [];
      let index = current.findIndex(val => val.id === action.data.id);
      if (index !== -1) {
        state[map.type][map.id] = update(current, action.data);
        return state;
      }
      state[map.type][map.id] = [
        ...current,
        action.data
      ];
      return state;
    }
    case 'update' : {
      state[map.type][map.id] = update(state, action.data);
      return state;
    }
    case 'delete' : {
      let current = state[map.type][map.id] || [];
      state[map.type][map.id] = current.reduce((list, val) => {
        if (val.id !== action.data.id) {
          list.push(val);
        }
        return list;
      }, []);
      return state;
    }
    default : {
      return state;
    }
  }
});

/**
 * Divines information on the relayed data
 * @param {Object} data
 * @return {Object}
 */
function divine(data) {
  if (Array.isArray(data)) data = data[0];
  if (!data) return;
  let map = {};
  if (data.bookingId) {
    map.type = 'booking';
    map.id = data.bookingId;
  } else if (data.carId) {
    map.type = 'car';
    map.id = data.carId;
  } else if (data.userId) {
    map.type = 'user';
    map.id = data.userId;
  }
  return map;
}

/**
 * Default state for notes
 * @return {Object}
 */
function defaultState() {
  return {
    car: {},
    booking: {},
    user: {}
  };
}

/**
 * Returns immutable array based on provided list and data.
 * @param  {Array}  list
 * @param  {Object} note
 * @return {Array}
 */
function update(list, note) {
  return list.map((val) => {
    if (val.id === cart.id) {
      return cart;
    }
    return val;
  });
}
