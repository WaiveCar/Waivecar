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

  *show(id) {
    return yield Organization.findById(id); 
  },
};
