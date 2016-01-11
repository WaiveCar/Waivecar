'use strict';

let error = Bento.Error;

Route.get('/config', {
  policy  : 'isAuthenticated',
  handler : function *() {
    if (!this.auth.user.hasAccess('super')) {
      throw error.parse({
        code    : `INVALID_CREDENTIALS`,
        message : `Your credentials does not contain the power of the ages`
      }, 401);
    }
    if (this.query.target) {
      return Bento.config[this.query.target];
    }
    return Bento.config;
  }
});
