'use strict';

export default function users(state = [], action) {
  switch (action.type) {
    case 'user:stored' :
      return [
        ...state,
        action.user
      ];
    case 'user:list' :
      return action.users;
    default :
      return state;
  }
}