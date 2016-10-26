'use strict';

let tokens      = require('./token-service');
let error       = require('./errors');
let bcrypt      = Bento.provider('bcrypt');
let queryParser = Bento.provider('sequelize/helpers').query;
let roles       = Bento.Interface.roles;
let hooks       = Bento.Hooks;
let relay       = Bento.Relay;
let config      = Bento.config.user;
let log         = Bento.Log;

// ### Models

let User      = Bento.model('User');
let Role      = Bento.model('Role');
let Group     = Bento.model('Group');
let GroupUser = Bento.model('GroupUser');
let GroupRole = Bento.model('GroupRole');
let sequelize = Bento.provider('sequelize');

module.exports = {

  /**
   * Stores a user in the database.
   * @param  {Object} payload
   * @param  {Object} _user
   * @return {Object}
   */
  *store(payload, _user) {
    let data = yield hooks.require('user:store:before', payload, _user);

    // ### Create User

    let user = new User(data);
    if (data.password) {
      user.password = yield bcrypt.hash(data.password, 10);
    }
    yield user.save();

    // ### Group Assignment

    let group = new GroupUser({
      groupId     : 1,
      userId      : user.id,
      groupRoleId : 1
    });
    yield group.save();

    yield hooks.require('user:store:after', user, _user);

    relay.emit('users', {
      type : 'store',
      data : yield this.get(user.id, _user)
    });

    return user;
  },

  /**
   * Creates an password access token used to reset a users password.
   * @param  {Mixed} identifier
   * @param  {String} resetUrl
   * @return {Object}
   */
  *passwordToken(identifier, resetUrl) {
    let user  = yield hooks.require('user:get', identifier);
    let token = yield tokens.create({
      id      : user.id,
      purpose : 'password-reset'
    });
    yield hooks.require('user:send-password-token', user, token, resetUrl);
  },

  /**
   * @param  {String} token
   * @param  {String} password
   * @return {Object}
   */
  *passwordReset(token, password) {
    let payload = yield tokens.get(token);
    if (payload.purpose !== 'password-reset') {
      throw error.parse({
        code    : 'TOKEN_INVALID',
        message : 'The provided token is not a valid reset token.'
      });
    }
    let user = yield this.get(payload.id);
    yield user.update({
      password : yield bcrypt.hash(password, 10)
    });
    yield tokens.delete(token);
  },

  /**
   * Returns an indexed array of users.
   * @param  {Object} query
   * @param  {Object} _user
   * @return {Array}
   */
  *index(query, _user) {
    let groupId    = _user ? _user.hasAccess('super') && query.groupId ? query.groupId : _user.group.id : 1;
    let groupUsers = yield GroupUser.find({
      where : {
        groupId : groupId
      }
    });

    // ### Create Query String

    let qs = query.search ? config.search(query.search) : config.filter(queryParser, query);
    /*
    qs.where.id = {
      $in : groupUsers.map(val => val.userId)
    };
    */

    let users = [];
    if(query.search) {
      users = yield User.find({
        where: {
          $or: [
            {email: {$like: `%${query.search}%` } },
            sequelize.literal(`concat_ws(' ', first_name, last_name) like '%${query.search}%'`)
          ]
        }
      });
    } else {
      users = yield User.find(qs);
    }
    //log.info(JSON.stringify(users));
    // ### Fetch Users

    if (!users.length) {
      return [];
    }

    // ### Fetch Group & Roles

    let group      = yield Group.findById(groupId);
    let groupRoles = yield GroupRole.find({
      where : {
        groupId : groupId
      }
    });

    // ### Map Group & Roles

    users.map(user => {
      let groupUser = groupUsers.find(groupUser => user.id === groupUser.userId);
      let groupRole = groupRoles.find(role => role.id === groupUser.groupRoleId);
      let role      = roles.find(role => role.id === groupRole.roleId);

      // ### Assign Attributes

      user.group = group;
      user.role  = {
        title : groupRole.name,
        name  : role.name
      };
    });

    // ### Omit Records

    if (query.omit) {
      let ids = query.omit.split(',').map(val => parseInt(val));
      return users.reduce((list, next) => {
        if (ids.indexOf(next.id) === -1) {
          list.push(next);
        }
        return list;
      }, []);
    }

    return users;
  },

  /**
   * Returns a user with the provided id, optionaly you can provide
   * an authenticated _user to check if they are allowed to retrieve
   * the user in question.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  *get(id, _user) {
    let user = yield User.findById(id);
    if (!user) {
      throw error.userNotFound();
    }

    let connector = yield GroupUser.findOne({
      where : {
        groupId : _user ? _user.group.id : 1,
        userId  : user.id
      }
    });

    if (!connector) {
      throw error.userNotFound();
    }

    let groupRole = yield GroupRole.findById(connector.groupRoleId);
    let role      = roles.find(role => role.id === groupRole.roleId);

    user.group = yield Group.findById(connector.groupId);
    user.role  = {
      title : groupRole.name,
      name  : role.name
    };

    return user;
  },

  /**
   * @param  {Number} id
   * @param  {Object}  payload
   * @param  {Object} _user
   * @return {Mixed}
   */
  *update(id, payload, _user) {
    let user = yield this.get(id, _user);

    if (user.id !== _user.id && !_user.hasAccess('admin')) {
      throw error.userUpdateRefused();
    }

    // admins can change a users role.
    if (_user.hasAccess('admin') && 'role' in payload) {
      // currently a user role is '1' and an admin is '3' ...
      // we aren't going to do fancy things to get there ... 
      // this isn't going to change.
      let newRole = parseInt(payload.role);
      if (Number.isNaN(newRole)) {
        newRole = {user:1, admin:3}[payload.role];
      }
      let groupUser = yield GroupUser.findOne({where: {userId: id} });
      console.log(id, groupUser, user);
      yield groupUser.update({groupRoleId: newRole});

    } else {

      let data = yield hooks.require('user:update:before', user, payload, _user);
      if (data.password) {
        data.password = yield bcrypt.hash(data.password, 10);
      }
      yield user.update(data);
      yield hooks.require('user:update:after', user, _user);
    }

    user.relay('update');

    return user;
  },

  /**
   * @param  {Number} id
   * @param  {Object} query [description]
   * @param  {Object} _user
   * @return {Object}
   */
  *delete(id, query, _user) {
    let user = yield this.get(id, _user);

    yield hooks.require('user:delete:before', user, query, _user);
    yield user.delete();

    relay.emit('users', {
      type : 'delete',
      data : user.toJSON()
    });

    return user;
  }

};
