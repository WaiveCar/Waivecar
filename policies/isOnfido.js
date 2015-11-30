'use strict';

let config = Bento.config;
let error = Bento.Error;

module.exports = function *isOnfido() {
  let signature = this.get('X-Signature');
  if (signature) {
    if (config.license.onfido.hook !== signature) {
      throw error.parse({
        code    : `INVALID_FOR_ENVIRONMENT`,
        message : `Token passed is not accepted in this environment.`
      }, 200);
    }
    return;
  }

  throw error.parse({
    code    : `MISSING_CREDENTIALS`,
    message : `You must pass credentials to gain access to this route.`
  }, 401);
};
