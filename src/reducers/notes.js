import { relay } from 'bento';

relay.resource('notes', function (state = [], action) {
  switch (action.type) {
    case 'index' : {
      return action.data;
    }
    case 'store' : {
      let index = state.findIndex(val => val.id === action.data.id);
      if (index !== -1) {
        return update(state, action.data);
      }
      return [
        ...state,
        action.data
      ];
    }
    case 'update' : {
      return update(state, action.data);
    }
    case 'delete' : {
      return state.reduce((list, val) => {
        if (val.id !== action.data.id) {
          list.push(val);
        }
        return list;
      }, []);
    }
    default : {
      return state;
    }
  }
});

/**
 * Returns immutable array based on provided list and data.
 * @param  {Array}  list
 * @param  {Object} cart
 * @return {Array}
 */
function update(list, cart) {
  return list.map((val) => {
    if (val.id === cart.id) {
      return cart;
    }
    return val;
  });
}
