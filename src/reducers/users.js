'use strict';

import { relay } from 'reach-react';

// ### Actions

relay.actions({

  /**
   * Adds newly created user to the state.
   * @method USERS_STORE
   * @param  {Object} user
   * @return {Object}
   */
  USERS_STORE: (user) => {
    return {
      type : 'store',
      user : user
    }
  },

  /**
   * Replaces the current state with the new state.
   * @method USERS_INDEX
   * @param  {Array} users
   * @return {Object}
   */
  USERS_INDEX: (users) => {
    return {
      type  : 'index',
      users : users
    }
  },

  /**
   * Updates user in current state if defined.
   * @method USERS_UPDATE
   * @param  {Object} user
   * @return {Object}
   */
  USERS_UPDATE: (user) => {
    return {
      type : 'update',
      user : user
    }
  },

  /**
   * Removes user from current state if defined.
   * @method USERS_DELETE
   * @param  {Object} user
   * @return {Object}
   */
  USERS_DELETE: (user) => {
    return {
      type : 'delete',
      user : user
    }
  }

});

// ### Resource Reducer

relay.resource('users', function (state = [], action) {
  switch (action.type) {
    case 'store':
      return [
        ...state,
        action.user
      ];
    case 'index':
      return action.users;
    case 'update':
      return state.map(function (user) {
        if (user.id === action.user.id) {
          user = action.user;
        }
        return user;
      });
    case 'delete':
      return state.map(function (user) {
        if (user.id === action.user.id) {
          return;
        }
        return user;
      });
    default:
      return state;
  }
});