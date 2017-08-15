'use strict';

let Intercom = require('intercom-client');

module.exports = {

    getClient(){
        let client = new Intercom.Client({token: 'dG9rOjJiN2E3N2Y4XzNkZWRfNDFmYV85MDQ4X2JhZjgzNTYyOTgxMzoxOjA='});
        return client;
    },

    /**
     * Add user to intercom
     * @param  {Object} user
     * @return {Object}
     */
    addUser(user){
        let client = this.getClient();
        client.users.create({
            email: user.email,
            phone: user.phone,
            name: user.firstName + ' ' + user.lastName
        }, function(err, d){
            return err ? err.body.errors[0] : err;
        });
    },

    /**
     * Remove user from intercom
     * @param  {Object} user
     * @return {Object}
     */
    removeUser(user){
        console.log(user);
        let client = this.getClient();
        // client.users.delete({ id: '1234' }, callback);
        client.users.list(function(err, d){
            //console.log(d ? d.body : err.body.errors[0]);
            return err ? err.body.errors[0] : err;
        });
    }
};