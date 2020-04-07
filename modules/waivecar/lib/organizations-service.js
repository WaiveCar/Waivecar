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
    return yield Organization.findById(id); 
  },

  *addUser(organizationId, payload) {
    let org = yield Organization.findById(organizationId);
  },

  *removeUser(organizationId, payload) {
    let org = yield Organization.findById(organizationId);
  },

  *addCar(organizationId, payload) {
    let org = yield Organization.findById(organizationId);
  },

  *removeCar(organizationId, payload) {
    let org = yield Organization.findById(organizationId);
  },
};
