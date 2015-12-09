'use strict';

Bento.Register.Model('User', 'sequelize', function register(model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'users';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    // ### Required Fields
    // These fields are locked and should not be removed or have its key changed.

    /**
     * Users first name.
     * @type {String}
     */
    firstName : {
      type      : Sequelize.STRING(28),
      allowNull : false
    },

    /**
     * Users last name.
     * @type {String}
     */
    lastName : {
      type      : Sequelize.STRING(28),
      allowNull : false
    },

    /**
     * Users email address.
     * @type {String}
     */
    email : {
      type   : Sequelize.STRING(128),
      unique : true
    },

    /**
     * Users encrypted password
     * @type {String}
     */
    password : {
      type : Sequelize.STRING(64)
    },

    // ### Optional Fields
    // All fields defined here are individual module required fields and can
    // be removed if you are not using the related model. It is a good idea
    // to mark what modules are dependent on the value so you know if its safe
    // to remove it or not inside of your setup.

    /**
     * Users phone number, user for SMS and identification purposes.
     * @type {String}
     */
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

    /**
     * The user current account status.
     * @type   {Enum}
     * @module waivecar
     */
    status : {
      type         : Sequelize.ENUM('pending', 'active', 'suspended'),
      defaultValue : 'pending'
    },

    /**
     * The users facebook id.
     * @type   {String}
     * @module auth
     */
    facebook : {
      type   : Sequelize.STRING,
      unique : true
    },

    /**
     * The users stripe id.
     * @type   {String}
     * @module shop
     */
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
    }

  };

  /**
   * List of custom out of schema attributes.
   * @type {Array}
   */
  model.attributes = [ 'email=>role', 'role=>group' ];

  /**
   * A list of blacklisted public values.
   * @type {Array}
   */
  model.blacklist = [ 'password' ];

  /**
   * A list of custom model methods.
   * @type {Object}
   */
  model.methods = {

    // ### Required Methods
    // These methods are locked and should not be removed or have its key changed.

    /**
     * Returns the users full name.
     * @return {String}
     */
    name() {
      return `${ this.firstName } ${ this.lastName }`;
    },

    // ### Role Methods
    // A batch of methods that can determine the users access rights.

    /**
     * Returns a boolean value if the users role is the provided value.
     * @param  {String}  val
     * @return {Boolean}
     */
    isRole(val) {
      return this.role === val;
    },

    /**
     * Returns a boolean value if the user is a moderator.
     * @return {Boolean}
     */
    isModerator() {
      return this.isRole('moderator');
    },

    /**
     * Returns a boolean value if the user is an administrator.
     * @return {Boolean}
     */
    isAdmin() {
      return this.isRole('admin');
    },

    /**
     * Returns a boolean value if the user is an owner.
     * @return {Boolean}
     */
    isOwner() {
      return this.isRole('owner');
    },

    /**
     * Returns a boolean value if the user is a super user.
     * @return {Boolean}
     */
    isSuper() {
      return this.isRole('super');
    },

    /**
     * Checks if the user has access based on the provided role.
     * @param  {String}  role
     * @return {Boolean}
     */
    hasAccess(role) {
      let roles = Bento.Interface.getRoles();
      let check = roles.findIndex(val => val.name === role);
      let auth  = roles.findIndex(val => val.name === this.role.name);

      // ### Access Check
      // If provided role is less than authenticated role we have access.

      return check.position <= auth.position;
    }

  };

  return model;

});
