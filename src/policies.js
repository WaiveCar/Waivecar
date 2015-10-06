'use strict';

import { auth } from 'reach-react';

export default {

  isAnyone : (nextState, transition) => {
  },

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
   * @method isActive
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isActive : (nextState, transition) => {
    if (!auth.check()) {
      transition.to('/login', null, {
        nextPathname : nextState.location.pathname
      });
    }
    if (auth.user.status !== 'active') {
      transition.to('/forbidden', null, {
        nextPathname : nextState.location.pathname
      });
    }
  },

  /**
   * @method isAdministrator
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isAdministrator : (nextState, transition) => {
    if (!auth.check()) {
      transition.to('/login', null, {
        nextPathname : nextState.location.pathname
      });
    }

    if (auth.user.role !== 'admin') {
      transition.to('/forbidden', null, {
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
  }

}