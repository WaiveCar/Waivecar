'use strict';

const initialState = [{
  key : Math.random().toString(36).slice(2),
  src : null
}];

export default function images(state = initialState, action) {
  switch (action.type) {
    case 'ADD_USER' :
      return [
        ...state,
        action.image
      ];
    default :
      return state;
  }
}