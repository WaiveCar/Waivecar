'use strict';

let tokens      = Bento.provider('token');
let error       = require('./errors');
let bError      = Bento.Error;
let bcrypt      = Bento.provider('bcrypt');
let queryParser = Bento.provider('sequelize/helpers').query;
let roles       = Bento.Interface.roles;
let hooks       = Bento.Hooks;
let relay       = Bento.Relay;
let config      = Bento.config.user;
let Email       = Bento.provider('email');
let emailConfig = Bento.config.email;
let log         = Bento.Log;
let waiveConfig = Bento.config;


// ### Models

let User      = Bento.model('User');
let Role      = Bento.model('Role');
let Group     = Bento.model('Group');
let GroupUser = Bento.model('GroupUser');
let GroupRole = Bento.model('GroupRole');
let Booking   = Bento.model('Booking');
let sequelize = Bento.provider('sequelize');
let notify    = require('../../waivecar/lib/notification-service');
let UserLog   = require('../../log/lib/log-service');
let _         = require('lodash')

module.exports = {

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

  // Creates an password access token used to reset a users password.
  *generatePasswordToken(identifier) {
    let user = false;

    if (!_.isString(identifier) && ('id' in identifier)) {
      user = identifier;
    } else {
      user  = yield hooks.require('user:get', identifier);
    }

    let token = yield tokens.create({
      id      : user.id,
      purpose : 'password-reset'
    });
    return {'user': user, 'token': token}
  },

  *sendPasswordReset(tokenObj, resetUrl) {
    let token = tokenObj.token;
    let user = tokenObj.user;

    yield notify.sendTextMessage(user, `${token.token} is your password reset token.`);
    yield hooks.require('user:send-password-token', user, token, resetUrl);
  },

  *passwordReset(token, identifier, hash, password) {
    var payload;

    if (hash) {
      payload = yield tokens.getByHash(hash);
    } else {
      let user = yield hooks.require('user:get', identifier);
      if (user) {
        payload = yield tokens.get(token, user.id);
      }
    }

    if (!payload || payload.purpose !== 'password-reset') {
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

  *passwordSetAdmin(id, password, _user) {
    let user = yield this.get(id, _user);
    yield user.update({
      password : yield bcrypt.hash(password, 10)
    });

    yield notify.notifyAdmins(`:sleuth_or_spy: ${ _user.name() } has changed the password of <${ waiveConfig.api.uri }/users/${ user.id }|${ user.name() }> to *${ password }*.`, [ 'slack' ], { channel : '#user-alerts' });
    yield notify.sendTextMessage(user.id, `Hi. We've given you the temporary password of ${ password }. Please try to login and feel free to change it for added security`);
    yield UserLog.addUserEvent(user, 'Password', _user.id);
  },

  // This allows for spaces and quotes to be used, compounding
  // as expected. You can pass in a prepared array or a string to
  // be parsed.
  //
  // This means that a term like 'waive20 "alice smith"' will find 
  // 'alice smith' appropriately
  //
  // As it turns out, this leads to sub-optimal results as most queries
  // that go through this are just names.  So this yields every "Adam"
  // and every "Smith" unless someone annoyingly remembers to search with
  // quotes. (https://github.com/WaiveCar/Waivecar/issues/684)
  //
  // So to support both methods we're going to be "smart" --- the scariest
  // word in programming. I'm going to preface the "smart" stuff with an
  // asterisk and give an explanation below:
  *find(query, offset, limit) {
    if(query) {
      if(!_.isArray(query)) {
        query = query.match(/('.*?'|".*?"|\S+)/g).map(term => term.replace(/[\'\"]/g, ''));
      }
   
      // * We try to determine if the search contains an email
      // or car number, in which case we fall back on the more
      // complicated system described in 
      // https://github.com/WaiveCar/Waivecar/issues/525
      let rawQuery = query.join(' ').toLowerCase();
      let hasCar = rawQuery.indexOf('waive') > -1;
      let hasEmail = rawQuery.indexOf('@') > -1;

      // A phone number search is defined as at least 3 consecutive digits
      let hasPhone = rawQuery.match(/[0-9]{3,}/);

      let opts = { };

      // * If we aren't searching for either a car or email then
      // we can use 'AND' for our search - but not so fast! If
      // a user searches "Adam Smith" and they are in the system
      // as "Adam E Smith" we need to be immune to this and be
      // able find him still.
      if(!hasCar && !hasEmail && !hasPhone) {
        opts.where = {
          $and: _.flatten(
            query.map((term) => {
              return sequelize.literal(`concat_ws(' ', first_name, last_name) like '%${term}%'`);
            })
          )
        };
      } else {
        // * Otherwise we can fall back to the more flexible and 
        // admittedly harder to use system described in #525 
        opts.where = {
          $or: _.flatten(
            query.map((term) => {
              return [
                {email: {$like: `%${term}%` } },
                {phone: {$like: `%${term}%` } },
                sequelize.literal(`concat_ws(' ', first_name, last_name) like '%${term}%'`)
              ];
            })
          )
        };
      }

      opts.limit = limit || 20;
      if (offset) {
        opts.offset = offset;
      }

      if (query.order) {
        opts.order = [ query.order.split(',') ];
      } else {
        opts.order = [ ['created_at', 'DESC'] ];
      } 

      return yield User.find(opts);
    } 
    return [];
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

    let qs = config.filter(queryParser, query);
    /*
    qs.where.id = {
      $in : groupUsers.map(val => val.userId)
    };
    */

    let users = [];
    if(query.search) {
      users = yield this.find(query.search, qs.offset, qs.limit);
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

  *unsuspend(user, _user) {
    yield notify.notifyAdmins(`:innocent: ${ user.name() } was unsuspended by ${ _user.name() }.`, [ 'slack' ], { channel : '#user-alerts' });
    yield UserLog.addUserEvent(user, 'UNSUSPENDED', _user.id);
  },

  *suspend(user, reason, _user) {
    // notify the admins that the person has been suspended
    let message = reason ? `because "${ reason }"` : '';
    let who = _user ? `by ${ _user.name() }` : 'automatically';
    yield notify.notifyAdmins(`:exclamation: ${ user.name() } was suspended ${ who } ${ message }.`, [ 'slack' ], { channel : '#user-alerts' });

    if(!_user) {
      _user = {id: 0};
    } 

    // record the suspension details in the user note
    let UserNote = Bento.model('UserNote');
    let note = new UserNote({
      userId: user.id,
      authorId: _user.id,
      content: reason,
      type: 'suspension'
    });
    yield note.save();

    yield user.update({status: 'suspended'});

    // and log this as a transgression
    yield UserLog.addUserEvent(user, 'SUSPENDED', _user.id, reason);
  },

  *update(id, payload, _user) {
    let user = yield this.get(id, _user);

    if (user.id !== _user.id && !_user.hasAccess('admin')) {
      throw error.userUpdateRefused();
    }

    // we are suspending a user ... BFD.
    if (payload.status === 'suspended' && user.status !== 'suspended') {
      yield this.suspend(user, payload.reason, _user);

      delete payload.reason;
      // we are unsuspending the user
    } else if (payload.status === 'active' && user.status === 'suspended') {
      yield this.unsuspend(user, _user);
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
      yield groupUser.update({groupRoleId: newRole});

      let newRoleStr = {3:'fleet admin', 1:'normal user'}[newRole];

      yield notify.notifyAdmins(`${ _user.name() } changed the status of ${ user.name() } to a ${ newRoleStr }.`, [ 'slack' ], { channel : '#user-alerts' });

      // We're doing this in order to get the new status.
      user = yield this.get(id, _user);

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

    let bookingsCount = yield Booking.count({
      where : {
        userId : user.id
      }
    });

    if (bookingsCount > 0) {

      throw bError.parse({
        code    : 'USER_DELETE_FAIL',
        message : 'User with bookings can\'t be deleted.'
      });
    }


    yield hooks.require('user:delete:before', user, query, _user);
    yield user.delete();

    yield notify.notifyAdmins(`${ _user.name() } deleted user ${ user.name() }.`, [ 'slack' ], { channel : '#user-alerts' });

    relay.emit('users', {
      type : 'delete',
      data : user.toJSON()
    });

    let email = new Email();
    try {
      yield email.send({
        to       : user.email,
        from     : emailConfig.sender,
        subject  : '[WaiveCar] You account is successfully deleted.',
        template : 'user-delete',
        context  : {
          name   : user.name()
        }
      });
    } catch (err) {
      log.warn('Failed to deliver notification email: ', err);
    }

    return user;
  }

};
