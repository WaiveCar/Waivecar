export default {

  /**
   * Adds a new list of users to the current reducer state.
   * @method ADD_USERS
   * @param  {Array} users
   * @return {Object}
   */
  ADD_USERS : function (users) {
    users.forEach(function (user, i) {
      user.key = Math.random().toString(36).slice(2);
      user[i]  = user;
    });
    return {
      type  : 'user:list',
      users : users
    }
  },

  /**
   * Appends a new user to the current reducer state.
   * @method ADD_USER
   * @param  {Object} user
   * @return {Object}
   */
  ADD_USER : function (user) {
    user.key = Math.random().toString(36).slice(2);
    return {
      type : 'user:stored',
      user : user
    };
  }
  
}