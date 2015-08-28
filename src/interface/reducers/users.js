'use strict';

import { Relay } from 'reach-react';

Relay.store('users', function (state = [], action) {
  switch (action.type) {
    case 'user:stored' :
      return [
        ...state,
        action.user
      ];
    case 'user:list' :
      return action.users;
    case 'user:updated' :
      return state.map(function (user) {
        if (user.id === action.user.id) {
          user = action.user;
        }
        return user;
      });
    default :
      return state;
  }
});