'use strict';

let Intercom = require('intercom-client');

module.exports = {

  getClient(){
      return new Intercom.Client({token: 'dG9rOjJiN2E3N2Y4XzNkZWRfNDFmYV85MDQ4X2JhZjgzNTYyOTgxMzoxOjA='});
  },

  *addUser (user){
    return yield this.getClient().users.create({
      email: user.email,
      phone: user.phone,
      name: user.firstName + ' ' + user.lastName
    });
  },

  *removeUser (user){
    let client = this.getClient();
    return yield client.users.delete({ id: user.id });
  },

  *update(who, what) {
    var payload = {user_id: who.id};

    if(what) {
      if(!Array.isArray(what)) {
        what = [what];
      }

      let topLevel = ['email', 'phone', 'name'];

      what.forEach((row) => {
        if(topLevel.indexOf(row) !== -1) {
          payload[row] = who[row];
        } else {
          if(!payload.custom_attributes) {
            payload.custom_attributes = {};
          }
          payload.custom_attributes[row] = who[row];
        }
      });
    }
    let res = yield (this.getClient()).users.update(payload);

    console.log(res);
  }

};
