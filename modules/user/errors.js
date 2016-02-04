'use strict';

Bento.Error.handler('POST /users', (err) => {
  if (err.code === 'SEQUELIZE_SAVE_ERROR' && err.data.type === 'SEQUELIZE_UNIQUE_CONSTRAINT_ERROR') {
	  let jsonError = JSON.parse(JSON.stringify(err));
		let badField = Object.keys(jsonError.data.fields)[0];
    err.code    = `USER_DUPLICATE`;
    err.status  = 400;
    err.data    = err.fields;

    if (badField === 'email') {
    	err.message = `The ${badField} address you entered is already attached to an account.`;
    } else if (badField === 'phone') {
    	err.message = `The ${badField} number you entered is already attached to an account.`;
    }
  }

  return err;
});
