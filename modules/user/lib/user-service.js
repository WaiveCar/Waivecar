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
let moment      = require('moment');

// ### Models

let User      = Bento.model('User');
let UserCommunication = Bento.model('UserCommunication');
let Role      = Bento.model('Role');
let Group     = Bento.model('Group');
let GroupUser = Bento.model('GroupUser');
let GroupRole = Bento.model('GroupRole');
let OrganizationUser = Bento.model('OrganizationUser');
let Booking   = Bento.model('Booking');
let ShopOrder = Bento.model('Shop/Order');
let sequelize = Bento.provider('sequelize');
let notify    = require('../../waivecar/lib/notification-service');
let UserLog   = require('../../log/lib/log-service');
let Intercom  = require('../../../hooks/user/lib/intercom-service.js');

let _         = require('lodash')

module.exports = {

  *updateIntercom() {
    let GroupRole = Bento.model('GroupRole');
    let GroupUser = Bento.model('GroupUser');
    let allRoles = yield GroupRole.find();
    let roleMap = {};
    let list = 'csula level waivework la'.split(' ');
    let idList = [];
    allRoles.forEach(row => {
      if (list.includes(row.name)) {
        roleMap[row.id] = row.name;
        idList.push(row.id);
      }
    });
    let allGroups = yield GroupUser.find({where: { groupRoleId: { $in: idList } } });
    let ix = 0, ttl = allGroups.length;
    for(var row of allGroups) {
      yield Intercom.update(row.userId, 'program', roleMap[row.groupRoleId]);
      console.log([row.userId, roleMap[row.groupRoleId], Math.round(100 * ix++ / ttl)]);
    }

  },

  *store(payload, _user, opts) {
    let data = yield hooks.require('user:store:before', payload, _user, opts);

    // ### Create User
    let user = new User(data);
    if (data.passwordEncrypted) {
      user.password = data.passwordEncrypted;
    } else if (data.password) {
      user.password = yield bcrypt.hash(data.password, 10);
    }
    try {
      yield user.save(); 
      // ### Group Assignment
      let group = new GroupUser({
        groupId     : 1,
        userId      : user.id,
        groupRoleId : 1
      });

      yield group.save();
      yield hooks.require('user:store:after', user, _user, opts);
      relay.emit('users', {
        type : 'store',
        data : yield this.get(user.id, _user)
      });

      return user;
    } catch(e) {
      let duplicateFields = [];
      if (e.data.type === 'SEQUELIZE_UNIQUE_CONSTRAINT_ERROR') {
        for (let field in e.data.fields) {
          duplicateFields.push(field);
        }
      }
      // Catching other sequlize error codes should also be done here
      throw bError.parse({
        code    : 'ERROR_STORING_USER',
        message : `There was an error storing your data. ${duplicateFields.length ? `An account was found using the provided ${duplicateFields.join(', ')}` : ''}`
      });
    }
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

    yield notify.sendTextMessage(user, `${token.token} is your password reset token. Please visit ${resetUrl}?hash={{${token.hash}}}`);
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
    let include = opts && opts.include;
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
              if (term.match(/work/g)) {
                return sequelize.literal(`concat_ws(' ', is_waivework=true)`)
              } else {
                return sequelize.literal(`concat_ws(' ', first_name, last_name, status) like '%${term}%'`);
              }
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
        opts.order = [ ['updated_at', 'DESC'] ];
      } 
      if (include) {
        opts.include = include;
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
    if (query.organizationIds) {
      qs.include = [
        {
          model: 'OrganizationUser',
          as: 'organizationUsers',
          where: {organizationId: {$in: JSON.parse(query.organizationIds)}},
        },
      ]
    }
    let users = [];
    if(query.search) {
      users = yield this.find(query.search, qs.offset, qs.limit, qs.include && {include: qs.include});
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
    let withOrgs = [];
    for (let user of users) {
      let orgs = yield user.getOrganizations();
      user = user.toJSON();
      user.organizations = orgs;
      withOrgs.push(user);
    }
    return withOrgs;
  },

  /**
   * Returns a user with the provided id, optionaly you can provide
   * an authenticated _user to check if they are allowed to retrieve
   * the user in question.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  *get(id, _user, fromShow) {
    let user = (yield User.findById(id));
    if (!user) {
      throw error.userNotFound();
    }
    let orgs = yield user.getOrganizations();
    if (fromShow) {
      user = user.toJSON();
    }
    user.organizations = orgs;

    let allRecords = yield GroupUser.find({
      where : { userId  : user.id },

      order : [[ 'group_id', 'asc' ]],

      include : [ 
        {
          model: 'Group',
          as: 'group'
        },
        {
          model: 'GroupRole',
          as: 'group_role'
        },
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

  *tagModify(verb, tag, _user) {
    if(['extend'].includes(tag)) {
      if(verb === 'add') {
        yield _user.addTag(tag);
        yield notify.notifyAdmins(`:rose: The munificent ${ _user.link() } added themselves to auto-extend.`, [ 'slack' ], { channel : '#user-alerts' });
        yield notify.sendTextMessage(_user, "Thanks for choosing auto-extend. Never lose a car again! You'll buy extensions automatically with each future booking. ($1.00 for 10 extra minutes, then $0.30/min thereafter until you get to the car). Reply \"No save\" to undo this.");
      }
      if(verb === 'del') {
        yield _user.delTag(tag);
        yield notify.notifyAdmins(`:wilted_flower: The miserly ${ _user.link() } removed themselves from auto-extend.`, [ 'slack' ], { channel : '#user-alerts' });
        yield notify.sendTextMessage(_user, "Sorry things didn't work out. Auto-extend is canceled. Reply \"Save always\" to extend automatically again. We welcome you to reach out to us to help improve the experience.");
      }
    }
    // Let's leave this end-point intentionally ambiguous
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
          // The user doesn't get any email that they've been removed, that's hostile.
        }
        if(toRemove[ix] === 'debit') {
          yield notify.notifyAdmins(`:face_with_monocle: ${ _user.name() } has decided ${ user.link() } shouldn't be able to use a debit card.`, [ 'slack' ], { channel : '#user-alerts' });
        }
        if(toRemove[ix] === 'extend') {
          yield notify.notifyAdmins(`:wilted_flower: ${ _user.name() } removed the miserly ${ user.link() } from auto-extend.`, [ 'slack' ], { channel : '#user-alerts' });
        }
      }

      // And add the new ones if relevant (this goes outside the 
      // regions exclusive
      let AllOldTags = yield user.getTagList();
      let toAdd = _.difference(payload.tagList, AllOldTags);

      for(var ix = 0; ix < toAdd.length; ix++) {
        yield user.addTag(toAdd[ix]);

        if(toAdd[ix] === 'debit') {
          yield notify.notifyAdmins(`:thinking_face: ${ _user.name() } decided it was ok for ${ user.link() } to use a debit card.`, [ 'slack' ], { channel : '#user-alerts' });
        }
        if(toAdd[ix] === 'extend') {
          yield notify.notifyAdmins(`:rose: ${ _user.name() } added the bounteous ${ user.link() } to auto-extend.`, [ 'slack' ], { channel : '#user-alerts' });
        }
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
      // I am not deleting the line below in case it breaks anything and needs to be put back in. It may be what 
      // is currently breaking password updates
      //delete payload.password;

      let data = yield hooks.require('user:update:before', user, payload, _user);
      if (data.password) {
        data.password = yield bcrypt.hash(data.password, 10);
      }
      yield user.update(data);
      if ('isWaivework' in payload) {
        if (payload.isWaivework) {
          yield notify.notifyAdmins(`:racing_car: ${ user.link()} has been added to WaiveWork by ${_user.name()}.`, [ 'slack' ], { channel : '#user-alerts' });
          log.info(`${user.name()} added to WaiveWork - ${moment().format('YYYY-MM-DD')}`);
        } else {
          yield notify.notifyAdmins(`:octagonal_sign: ${ user.link()} has been removed from WaiveWork by ${_user.name()}.`, [ 'slack' ], { channel : '#user-alerts' });
          log.info(`${user.name()} removed from WaiveWork - ${moment().format('YYYY-MM-DD')}`);
        }
      }
      yield hooks.require('user:update:after', user, _user);
    }

    user.relay('update');
  
    return user;
  },

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
  },

  *stats(userId) {
    let allOrders = yield ShopOrder.find({
      where: {
        userId, 
        description: {$notLike: '%authorization%'},
        status: 'paid',
        status: {$not: 'refunded'},
        amount: {$lte: 70 * 100}
      }
    });
    let totalSpent = yield ShopOrder.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'amount'],
      ],
      where: {
        userId,
        status: 'paid',
        description: {$notLike: '%authorization%'},
        status: {$not: 'refunded'},
      }
    });
    let allBookings = yield Booking.find({
      where: {
        userId,
      }
    });
    let monthAgo = moment().subtract(30, 'days');
    let weekAgo = moment().subtract(7, 'days');
    let dayAgo = moment().subtract(1, 'days');
    return {
      totalSpent: (totalSpent.amount / 100).toFixed(2),
      totalBookings: allBookings.length,
      allTime: {
        orders: allOrders,
        bookings: allBookings,
      },
      month: {
        orders: allOrders.filter(order => order.createdAt > monthAgo),
        bookings: allBookings.filter(booking => booking.createdAt > monthAgo),
      },
      week: {
        orders: allOrders.filter(order => order.createdAt > weekAgo),
        bookings: allBookings.filter(booking => booking.createdAt > weekAgo),
      }, 
      day: {
        orders: allOrders.filter(order => order.createdAt > dayAgo),
        bookings: allBookings.filter(booking => booking.createdAt > dayAgo),
      }
    }
  },

  *communications(userId, query) {
    return yield UserCommunication.find({
      where: {userId, type: query.type}, 
      order: [['created_at', 'DESC']],
      offset: Number(query.offset),
      limit: Number(query.limit),
      include: [
        {
          model: 'User',
          as: 'creator',
          allowNull: true,
        },
      ],
    });
  },
  
  *resendEmail(id) {
    let record = yield UserCommunication.findById(id);
    let email = new Email();
    let ctx = JSON.parse(record.content);
    let user = yield User.findById(record.userId);
    // The lines below exist to make sure that the correct information is changed in the email if a user has updated their 
    // personal info
    if (user.email !== ctx.to) {
      ctx.to = user.email;
    }
    Object.assign(ctx.context, user);
    if (ctx.context.user) {
      Object.assign(ctx.context.user, user);
    }
    yield email.send(ctx)
  }
};
