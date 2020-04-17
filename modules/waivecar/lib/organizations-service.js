let UserService = require('./user-service');
let LicenseService = require('../../license/lib/license-service');
let Organization = Bento.model('Organization');
let User = Bento.model('User');

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

  *create(payload) {
    let {name} = payload;
    let org = new Organization({name});
    yield org.save();
    return org;
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
    let org = yield Organization.findById(organizationId);
    return yield org[action](payload);
  },

  *addUser(payload, _user) {
    payload.status = 'active';
    let user = (yield UserService.store(payload)).toJSON();
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
    return user;
  },
};
