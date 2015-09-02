'use strict';

import { Auth } from 'reach-react';

export default {

  /**
   * @method isAuthenticated
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isAuthenticated: function (nextState, transition) {
    if (!Auth.check()) {
      transition.to('/login', null, {
        nextPathname : nextState.location.pathname
      });
    }
  },

  /**
   * @method isAnonymous
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isAnonymous: function (nextState, transition) {
    if (Auth.check()) {
      transition.to('/profile', null);
    }
  }

}