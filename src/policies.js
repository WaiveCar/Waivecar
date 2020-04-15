import { auth } from 'bento';

module.exports = {

  isAnyone : (nextState, replaceState) => {
  },

  /**
   * @method isAuthenticated
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isAuthenticated : (nextState, replaceState) => {
    let user = auth.user();
    if (!user) {
      return replaceState(null, '/login', {
        nextPathname : nextState.location.pathname
      });
    }
    // Now, we will direct all non-admins to  waivework.com. There 
    // is no longer a reason for them to be here
    if (!user.hasAccess('admin')) {
      return replaceState(null, '/work-redirect');
    }
  },

  /**
   * @method isActive
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isActive : (nextState, replaceState) => {
    let user = auth.user();
    if (!user) {
      return replaceState(null, '/login', {
        nextPathname : nextState.location.pathname
      });
    }
    if (user.status !== 'active') {
      return replaceState(null, '/forbidden');
    }
  },

  /**
   * @method isAdministrator
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isAdministrator : (nextState, replaceState) => {
    let user = auth.user();
    if (!user) {
      return replaceState(null, '/login', {
        nextPathname : nextState.location.pathname
      });
    }
    if (!user.hasAccess('admin')) {
      return replaceState(null, '/forbidden');
    }
  },

  /**
   * @method isAnonymous
   * @param  {Object} nextState
   * @param  {Object} transition
   */
  isAnonymous : (nextState, replaceState) => {
    let user = auth.user();
    if (user) {
      if (user.hasAccess('admin')) {
        return replaceState(null, '/dashboard');
      }
      return replaceState(null, '/profile');
    }
  },

  isWaiveAdmin : (nextState, replaceState) => {
    let user = auth.user();
    if (!user) {
      return replaceState(null, '/login', {
        nextPathname : nextState.location.pathname
      });
    }
    if (!user.hasAccess('waiveAdmin')) {
      return replaceState(null, '/forbidden');
    }
  }
}
