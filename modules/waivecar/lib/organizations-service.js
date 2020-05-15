let UserService = require('./user-service');
let LicenseService = require('../../license/lib/license-service');
let OrderService = require('../../shop/lib/order-service');
let notify = require('./notification-service');
let Organization = Bento.model('Organization');
let OrganizationStatement = Bento.model('OrganizationStatement');
let User = Bento.model('User');
let Email = Bento.provider('email');
let error = Bento.Error;
let log = Bento.Log;
let config = Bento.config;
let moment = require('moment');

module.exports = {
  *index(query) {
    if (!Object.keys(query).length) {
      return yield Organization.find();
    } else {
      let opts = {
        where: {
          ...(query.name ? {name: {$like: `%${query.name}%`}} : {}),
          ...(query.excluded ? {id: {$notIn: JSON.parse(query.excluded)}} : {}),
        },
        ...(query.limit ? {limit: Number(query.limit)} : {}),
        ...(query.offset ? {offset: Number(query.offset)} : {}),
        ...(query.order ? {order: [query.order.split(',')]} : {}),
        ...(query.includeImage
          ? {
              include: [
                {
                  model: 'File',
                  as: 'logo',
                },
              ],
            }
          : {}),
      };
      return yield Organization.find(opts);
    }
  },

  *create(payload, _user) {
    try {
      let {name} = payload;
      let org = new Organization({name});
      yield org.save();
      yield notify.notifyAdmins(
        `:new: ${_user.link()} created the new organization ${org.link()}`,
        ['slack'],
        {channel: '#organizations'},
      );
      return org;
    } catch (e) {
      log.warn(e);
      throw error.parse(
        {
          code: 'ERROR_CREATING_ORGANIZATION',
          message: e.data ? e.data.type : e.message,
        },
        500,
      );
    }
  },

  *show(id, query) {
    let q = {
      where: {id},
      include: [
        {model: 'Car', as: 'cars'},
        {model: 'OrganizationUser', as: 'organizationUsers'},
        {model: 'OrganizationStatement', as: 'organizationStatements'},
      ],
    };
    if (query.includeImage) {
      q.include.push({model: 'File', as: 'logo'});
    }
    let org = yield Organization.findOne(q);
    // What is done below is only done because the current implementation of the
    // ORM is broken and and nested includes do not work at all.
    let ids = org.organizationUsers.map(orgUser => orgUser.userId);
    let users = yield User.find({where: {id: {$in: ids}}});
    org = org.toJSON();
    org.users = users;
    return org;
  },

  *action(organizationId, action, payload) {
    try {
      let org = yield Organization.findById(organizationId);
      return yield org[action](payload);
    } catch (e) {
      log.warn(e);
      throw error.parse(
        {
          code: 'ERROR_TAKING_ORGANIZATION_ACTION',
          message: e.data ? e.data.type : e.message,
        },
        500,
      );
    }
  },

  *addUsers(payload, _user) {
    let successful = [];
    let failed = [];
    for (let user of payload.users) {
      try {
        user.status = 'active';
        user.isWaivework = true;
        let newUser = yield UserService.store(user);
        let orgs = yield Organization.find({
          where: {id: {$in: payload.organizations}},
        });
        for (let org of orgs) {
          yield org.addUser({userId: newUser.id});
        }
        newUser.organizations = orgs;
        if (newUser.number) {
          newUser.license = yield LicenseService.store(
            {userId: newUser.id, ...payload},
            _user,
          );
        }
        yield notify.notifyAdmins(
          `:heavy_plus_sign: ${_user.name()} added the new user ${newUser.link()}`,
          ['slack'],
          {channel: '#user-alerts'},
        );
        yield notify.sendTextMessage(
          newUser.id,
          `Hi. Welcome to WaiveWork! Please check your e-mail for a link to set your password.`,
        );
        if (user.isAdmin) {
          yield UserService.update(newUser.id, {groupId: 1, groupRoleId: 3}, _user);
        }
        try {
          let res = yield UserService.generatePasswordToken(newUser, 7 * 24 * 60);
          let passwordLink = `${config.api.uri}/reset-password?hash=${res.token.hash}&isnew=yes&iswork=yes`;
          let email = new Email();
          let emailOpts = {
            to: newUser.email,
            from: config.email.sender,
            subject: 'Your WaiveWork Password',
            template: 'waivework-general',
            context: {
              name: newUser.name(),
              text: `Welcome to WaiveWork! Please set your password by going <a href=${passwordLink}>here</a>.`,
            },
          };
          yield email.send(emailOpts);
        } catch (e) {
          log.warn('error sending email', e.message);
        }
        successful.push(newUser);
      } catch(e) {
        failed.push({user, error: e.message});
      }
    }
    if (failed.length) {
      throw error.parse({
        code    : 'SOME_USERS_FAILED',
        message : 'Failed to add some of the users you tried to add',
        data: {failed, successful},
      });
    }
    return {successful};
  },

  *getStatements(id) {
    return yield OrganizationStatement.find({where: {organizationId: id}});
  },

  *createStatement(payload) {
    try {
      let statement = new OrganizationStatement(payload);
      yield statement.save();
      return statement;
    } catch (e) {
      log.warn(e);
      throw error.parse(
        {
          code: 'ERROR_CREATING_STATEMENT',
          message: `Error creating statement ${e.message}`,
        },
        500,
      );
    }
  },

  *payStatement(id, _user) {
    let statement = yield OrganizationStatement.findOne({
      where: {id},
      include: [{model: 'Organization', as: 'organization'}],
    });
    _user = yield User.findById(_user.id);

    let data = {};
    data.source = 'Statement Payment';
    data.amount = statement.amount;
    data.description = `Payment for statement ${statement.id} for ${statement.organization.name} by ${_user.firstName} ${_user.lastName}`;
    data.userId = _user.id;

    try {
      let charge = (yield OrderService.quickCharge(data, _user, {
        overrideAdminCheck: true,
      })).order;
      yield notify.slack(
        {
          text: `:ok_hand: ${statement.organization.name} charged $${(
            data.amount / 100
          ).toFixed(2)} for the statement due on ${moment(
            statement.dueDate,
          ).format('MM/DD/YYYY')}`,
        },
        {channel: '#waivework-charges'},
      );
      yield statement.update({
        status: 'paid',
        paidDate: moment(),
        paymentId: charge.id,
      });
      return statement;
    } catch (e) {
      yield notify.slack(
        {
          text: `:imp: ${statement.organization.name} failed to charge $${(
            data.amount / 100
          ).toFixed(2)} for their statement due on ${moment(
            statement.dueDate,
          ).format('MM/DD/YYYY')}. ${e.message}`,
        },
        {channel: '#waivework-charges'},
      );
      throw error.parse(
        {
          code: 'STATEMENT_PAYMENT_FAILED',
          message: e.message,
        },
        404,
      );
    }
  },

  *deleteStatement(id) {
    try {
      let statement = yield OrganizationStatement.findById(id);
      return yield statement.delete();
    } catch (e) {
      throw error.parse(
        {
          code: 'STATEMENT_DELETE_FAILED',
          message: e.message,
        },
        404,
      );
    }
  },
};
