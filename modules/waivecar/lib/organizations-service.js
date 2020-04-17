let UserService = require('./user-service');
let LicenseService = require('../../license/lib/license-service');
let notify = require('./notification-service');
let Organization = Bento.model('Organization');
let User = Bento.model('User');
let error = Bento.Error;

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
      throw error.parse(
        {
          code: 'ERROR_CREATING_ORGANIZATION',
          message: e.data ? e.data.type : e.message,
        },
        500,
      );
    }
  },

  *show(id, payload) {
    let org = yield Organization.findOne({
      where: {id},
      include: [
        {model: 'Car', as: 'cars'},
        {model: 'OrganizationUser', as: 'organizationUsers'},
      ],
    });
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
      throw error.parse(
        {
          code: 'ERROR_TAKING_ORGANIZATION_ACTION',
          message: e.data ? e.data.type : e.message,
        },
        500,
      );
    }
  },

  *addUser(payload, _user) {
    try {
      payload.status = 'active';
      payload.isWaivework = true;
      let user = yield UserService.store(payload);
      let orgs = yield Organization.find({
        where: {id: {$in: payload.organizations}},
      });
      for (let org of orgs) {
        yield org.addUser({userId: user.id});
      }
      user.organizations = orgs;
      if (payload.number) {
        user.license = yield LicenseService.store(
          {userId: user.id, ...payload},
          _user,
        );
      }
      yield notify.notifyAdmins(
        `:heavy_plus_sign: ${_user.name()} added the new user ${user.link()}`,
        ['slack'],
        {channel: '#user-alerts'},
      );
      yield notify.sendTextMessage(
        user.id,
        `Hi. Welcome to WaiveWork! Please check your e-mail for a link to set your password.`,
      );
      return user;
    } catch (e) {
      throw error.parse(
        {
          code: 'ERROR_ADDING_USER',
          message: e.data ? e.data.type : e.message,
        },
        500,
      );
    }
  },
};
