import { relay } from 'bento';

relay.resource('logs', function (state = [], action) {
  switch (action.type) {
    case 'index' : {
      state = action.data;
      return state;
    }
    case 'store' : {
      let index = state.findIndex(val => val.id === action.data.id);
      if (index !== -1) {
        return update(state, action.data);
      }
      return [
        action.data,
        ...state
      ];
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
