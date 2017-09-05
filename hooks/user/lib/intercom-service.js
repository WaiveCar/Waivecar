'use strict';

let Intercom = require('intercom-client');

module.exports = {

    getClient(){
        return new Intercom.Client({token: 'dG9rOjJiN2E3N2Y4XzNkZWRfNDFmYV85MDQ4X2JhZjgzNTYyOTgxMzoxOjA='});
    },

    /**
     * Add user to intercom
     * @param  {Object} user
     * @return {Object}
     */
    *addUser (user){
        return yield this.getClient().users.create({
            email: user.email,
            phone: user.phone,
            name: user.firstName + ' ' + user.lastName
        });
    },

    /**
     * Remove user from intercom
     * @param  {Object} user
     * @return {Object}
     */
    *removeUser(user){
        let client = this.getClient();
        let u = yield client.users.find({ email: user.email });
        return yield client.users.delete({ id: u.body.id });
    }
};