'use strict';
let apiConfig   = Bento.config.api;

Bento.Register.Model('User', 'sequelize', function register(model, Sequelize) {

  model.table = 'users';

  model.schema = {

    // ### Required Fields
    // These fields are locked and should not be removed or have its key changed.

    firstName : {
      type      : Sequelize.STRING(28),
      allowNull : false
    },

    lastName : {
      type      : Sequelize.STRING(28),
      allowNull : false
    },

    email : {
      type   : Sequelize.STRING(128),
      unique : true
    },

    password : {
      type : Sequelize.STRING(64)
    },

    // ### Optional Fields
    // All fields defined here are individual module required fields and can
    // be removed if you are not using the related model. It is a good idea
    // to mark what modules are dependent on the value so you know if its safe
    // to remove it or not inside of your setup.

    phone : {
      type   : Sequelize.STRING(128),
      unique : true
    },

    /**
     * Users profile image.
     * @type   {String}
     * @module files
     */
    avatar : {
      type : Sequelize.STRING
    },

    status : {
      type         : Sequelize.ENUM('active', 'probation', 'pending', 'suspended', 'waitlist'),
      defaultValue : 'waitlist'
    },

    facebook : {
      type   : Sequelize.STRING,
      unique : true
    },

    stripeId : {
      type   : Sequelize.STRING(64),
      unique : true
    },

    // ### Verification
    // Various verification parameters used to define the account status.
    // @module waivecar

    verifiedPhone : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    verifiedEmail : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    credit : {
      type         : Sequelize.DECIMAL(10,2),
      defaultValue : 0
    },

    tested : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    isWaivework : {
      type         : Sequelize.BOOLEAN,
      defaultValue : false
    },

    state : {
      type         : Sequelize.STRING,
      defaultValue : false
    },

    device : {
      type         : Sequelize.STRING,
      defaultValue : false
    },

    notifyEnd : {
      type         : Sequelize.DATE,
      defaultValue : false
    },

    version : {
      type         : Sequelize.INTEGER,
      defaultValue : null
    },

    latitude : {
      type      : Sequelize.DECIMAL(10, 8),
    },

    longitude : {
      type      : Sequelize.DECIMAL(11, 8),
    }
  };

  /**
   * List of custom out of schema attributes.
   * @type {Array}
   */
  model.attributes = [ 'email=>role', 'role=>group' ];

  // A list of blacklisted public values.
  model.blacklist = [ 'password' ];

  model.methods = {

    // ### Required Methods
    // These methods are locked and should not be removed or have its key changed.

    name() {
      return `${ this.firstName } ${ this.lastName }`;
    },

    link() {
      return `<${ apiConfig.uri }/users/${ this.id }|${ this.name() }>`;
    },

    // This is used mostly in slack messages ... it emits the users phone number 
    // in a non-stupid way.
    info() {
      return this.phone ? this.phone.replace(/^\+1(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : '';
    },

    *notes(opts) {
      let UserNote = Bento.model('UserNote');
      opts = opts || {};
      opts.user_id = this.id;
      return yield UserNote.find({
        order: [ [ 'id', 'desc' ] ],
        where: opts
      });
    },

    // ### Role Methods
    // A batch of methods that can determine the users access rights.

    /**
     * Checks if the user has access based on the provided role.
     * @param  {String}  role
     * @return {Boolean}
     */
    hasAccess(role) {
      try {
        let roles = Bento.Interface.roles;
        let check = roles.find(val => val.name === role);
        let auth  = roles.find(val => val.name === this.role.name);

        // ### Access Check
        // If provided role is less than authenticated role we have access.

        return check.position <= auth.position;
      } catch (ex) { }
      return false;
    },

    isAdmin() {
      return this.hasAccess('admin');
    },

    isActive() {
      return this.status === 'active';
    },

    isProbation() {
      return this.status === 'probation';
    },

    isPending() {
      return this.status === 'pending';
    },

    isSuspended() {
      return this.status === 'suspended';
    },

    *setActive() {
      yield this.update({
        status : 'active'
      });
    },

    *setProbation() {
      yield this.update({
        status : 'probation'
      });
    },

    *setPending() {
      yield this.update({
        status : 'pending'
      });
    },

    *setSuspended() {
      yield this.update({
        status : 'suspended'
      });
    }

  };

  return model;

});
