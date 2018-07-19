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
let Intercom  = require('../../../hooks/user/lib/intercom-service.js');

let _         = require('lodash')

module.exports = {

  *store(payload, _user) {
    let data = yield hooks.require('user:store:before', payload, _user);

    // ### Create User
    let user = new User(data);
    if (data.passwordEncrypted) {
      user.password = data.passwordEncrypted;
    } else if (data.password) {
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
  *generatePasswordToken(identifier, expire) {
    expire = expire || (24 * 60);
    let user = false;

    if (!_.isString(identifier) && identifier && ('id' in identifier)) {
      user = identifier;
    } else {
      user  = yield hooks.require('user:get', identifier);
    }

    let token = yield tokens.create({
      id      : user.id,
      purpose : 'password-reset'
    }, expire);
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
      throw bError.parse({
        code    : 'TOKEN_INVALID',
        message : 'The provided token is not a valid reset token.'
      });
    }
    if (!password || password.length === 0) {
      throw bError.parse({
        code    : 'PASSWORD_INVALID',
        message : 'A password must be supplied'
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
  *find(query, offset, limit, opts) {
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
              return sequelize.literal(`concat_ws(' ', first_name, last_name, status) like '%${term}%'`);
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

  *index(query, _user) {
    let start=new Date();
    let groupId    = _user ? _user.hasAccess('super') && query.groupId ? query.groupId : _user.group.id : 1;
    /*
    let groupUsers = yield GroupUser.find({
      where : {
        groupId : groupId
      }
    });
    */

    // ### Create Query String

    let qs = config.filter(queryParser, query);
    // qs.where.status = { $not: 'waitlist' };

    let users = [];
    if(query.search) {
      users = yield this.find(query.search, qs.offset, qs.limit);
    } else {
      qs.order = [['updated_at', 'DESC']];
      users = yield User.find(qs);
    }
    //log.info(JSON.stringify(users));
    // ### Fetch Users

    if (!users.length) {
      return [];
    }

    // ### Fetch Group & Roles

    /*
    let group      = yield Group.findById(groupId);
    let groupRoles = yield GroupRole.find({
      where : {
        groupId : groupId
      }
    });

    console.log(new Date() - start);
    // ### Map Group & Roles

    users.map(user => {
      let groupUser = groupUsers.find(groupUser => user.id === groupUser.userId);
      let groupRole = groupRoles.find(role => role.id === groupUser.groupRoleId);
      let role      = roles.find(role => role.id === groupRole.roleId);

      // ### Assign Attributes

      user.group = group;
      user.groupRole = groupRole;
      user.role  = {
        title : groupRole.name,
        name  : role.name
      };
    });
    */

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

    let allRecords = yield GroupUser.find({
      where : { userId  : user.id },

      order : [[ 'id', 'asc' ]],

      include : [ 
        {
          model: 'Group',
          as: 'group'
        },
        {
          model: 'GroupRole',
          as: 'group_role'
        }
      ]
    });

    let connector = allRecords[0]; 

    if (!connector) {
      throw error.userNotFound();
    }

    let role      = roles.find(role => role.id === connector.groupRole.roleId);

    user.tagList = allRecords;
    user.group = connector.group;
    user.groupRole = connector.groupRole;
    user.role  = {
      title : connector.groupRole.name,
      name  : role.name
    };

    return user;
  },

  *unsuspend(user, _user) {
    yield notify.notifyAdmins(`:innocent: ${ user.name() } was unsuspended by ${ _user.name() }.`, [ 'slack' ], { channel : '#user-alerts' });
    yield user.update({status: 'active'});
    yield UserLog.addUserEvent(user, 'UNSUSPENDED', _user.id);
    yield Intercom.update(user, 'status');
  },

  *suspend(user, reason, _user) {
    // notify the admins that the person has been suspended
    let message = reason ? `because "${ reason }"` : '';
    let who = _user ? `by ${ _user.name() }` : 'automatically';

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

    yield notify.notifyAdmins(`:exclamation: ${ user.name() } was suspended ${ who } ${ message }.`, [ 'slack' ], { channel : '#user-alerts' });
    yield user.update({status: 'suspended'});
    yield UserLog.addUserEvent(user, 'SUSPENDED', _user.id, reason);
    yield Intercom.update(user, 'status');
  },

  *notifyStart() {
  },

  *notifyEnd() {
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

    if (payload.tagList) {
      payload.tagList = payload.tagList.map((row) => { return row.toLowerCase(); });

      // this is explicitly only regions because we don't want to remove
      // user permissions.
      let oldTags = yield user.getTagList(['region', 'perk']);      

      // We remove the ones we've unchecked
      let toRemove = _.difference(oldTags, payload.tagList);
      for(var ix = 0; ix < toRemove.length; ix++) {
        yield user.untag(toRemove[ix]);

        if(toRemove[ix] === 'aid') {
          yield notify.notifyAdmins(`:runner: ${ _user.name() } removed ${ user.link() } from WaiveAid.`, [ 'slack' ], { channel : '#user-alerts' });
        }
        // The user doesn't get any email that they've been removed, that's hostile.
      }

      // And add the new ones if relevant (this goes outside the 
      // regions exclusive
      let AllOldTags = yield user.getTagList();
      let toAdd = _.difference(payload.tagList, AllOldTags);

      for(var ix = 0; ix < toAdd.length; ix++) {
        yield user.addTag(toAdd[ix]);

        if(toAdd[ix] === 'aid') {
          yield notify.notifyAdmins(`:older_adult: ${ _user.name() } added ${ user.link() } to WaiveAid.`, [ 'slack' ], { channel : '#user-alerts' });

          yield (new Email()).send({
            to: user.email,
            from: emailConfig.sender,
            subject: "Welcome to WaiveAid",
            template: "waiveaid-welcome"
          });
        }
      }
    }

    // admins can change a users group role.
    if (_user.hasAccess('admin') && 'groupRoleId' in payload) {
      //check if exists
      let newGroupRole = yield GroupRole.findById(payload.groupRoleId);
      if(!newGroupRole) {
        throw error.userUpdateRefused();
      }

      let groupUser = yield GroupUser.findOne({where: {groupId: payload.groupId, userId: id} });
      yield groupUser.update({groupRoleId: newGroupRole.id});

      let newGroupRoleName = newGroupRole.name;

      yield notify.notifyAdmins(`${ _user.name() } changed the status of ${ user.name() } to a ${ newGroupRoleName }.`, [ 'slack' ], { channel : '#user-alerts' });

      // We're doing this in order to get the new status.
      user = yield this.get(id, _user);
    } else {
      delete payload.password;

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
