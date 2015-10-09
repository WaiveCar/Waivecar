'use strict';

import { auth } from 'reach-react';

export default {

  isAnyone : (nextState, replaceState) => {
  },

  /**
   * @method isAuthenticated
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isAuthenticated : (nextState, replaceState) => {
    if (!auth.check()) {
      return replaceState(null, '/login', {
        nextPathname : nextState.location.pathname
      });
    }
  },

  /**
   * @method isActive
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isActive : (nextState, replaceState) => {
    if (!auth.check()) {
      return replaceState(null, '/login', {
        nextPathname : nextState.location.pathname
      });
    }
    if (auth.user.status !== 'active') {
      return replaceState(null, '/forbidden', {
        nextPathname : nextState.location.pathname
      });
    }
  },

  /**
   * @method isAdministrator
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isAdministrator : (nextState, replaceState) => {
    if (!auth.check()) {
      return replaceState(null, '/login', {
        nextPathname : nextState.location.pathname
      });
    }

    if (auth.user.role !== 'admin') {
      return replaceState(null, '/forbidden', {
        nextPathname : nextState.location.pathname
      });
    }
  },

  /**
   * @method isAnonymous
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isAnonymous : (nextState, replaceState) => {
    if (auth.check()) {
      if (auth.user.role === 'admin') {
        return replaceState(null, '/dashboard');
      }
      return replaceState(null, '/profile');
    }
  }

}