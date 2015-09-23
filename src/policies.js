'use strict';

import { auth } from 'reach-react';

export default {

  /**
   * @method isAuthenticated
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isAuthenticated : (nextState, transition) => {
    if (!auth.check()) {
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
  isAnonymous : (nextState, transition) => {
    if (auth.check()) {
      if (auth.user.role === 'admin') {
        return transition.to('/dashboard', null);
      }

      return transition.to('/profile', null);
    }
  },

  /**
   * @method canBook
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  canBook : (nextState, transition) => {
    // user needs to be authed, verified, valid license, valid payment.

    if (!auth.check()) {
      transition.to('/', null);
      // TODO: show an alert 'you need to be registered to perform this action'.
    }

    if (auth.user.status !== 'active') {
      transition.to('/', null);
      // TODO: show an alert 'you need to be verified to perform this action'.
    }

  }

}