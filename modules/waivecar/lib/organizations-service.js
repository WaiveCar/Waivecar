let Organization = Bento.model('Organization');
let User = Bento.model('User');

module.exports = {
  *index(query) {
    if (!query) {
      return yield Organization.find();
    } else {
      return yield Organization.find({
        where: {
          name: {$like: `%${query.name}%`},
          id: {$notIn: JSON.parse(query.excluded)},
        },
        limit: query.limit || 10,
      });
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
};
