let Organization = Bento.model('Organization');

module.exports = {
  *index() {
    return yield Organization.find();
  },

  *create(payload) {
    let {name} = payload;
    let org = new Organization({name});
    yield org.save();
    return org;
  },

  *show(id, payload) {
    return yield Organization.findOne({
      where: {id},
      include: [
        {model: 'Car', as: 'cars'},
        {model: 'OrganizationUser', as: 'organizationUsers'},
      ],
    });
  },

  *action(organizationId, action, payload) {
    let org = yield Organization.findById(organizationId);
    return yield org[action](payload);
  },
};
