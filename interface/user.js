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

    role : {
      type : Sequelize.ENUM(

        // ### Roles
        // Feel free to add new roles to this enum, just make sure not to remove
        // or edit out the locked roles [ 'user', 'admin' ].

        'user', // Lowest role for a registered user
        'admin' // Highest role for a registered user

      ),
      defaultValue : 'user'
    },

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

    // ### Avatar
    // The users profile image
    // Module: files

    avatar : {
      type : Sequelize.STRING
    },

    // ### Status
    // Module: waivecar

    status : {
      type         : Sequelize.ENUM('pending', 'active', 'suspended'),
      defaultValue : 'pending'
    },

    // ### Facebook
    // Module: auth

    facebook : {
      type   : Sequelize.STRING,
      unique : true
    },

    // ### Stripe ID
    // Module: shop

    stripeId : {
      type   : Sequelize.STRING(64),
      unique : true
    },

    // ### Verification
    // Various verification parameters used to define the account status.
    // Module: waivecar

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
   * The relation definitions of your model.
   * @property relations
   * @type     Array
   */
  model.relations = [
    'Group',
    function relation(Group) {
      this.belongsToMany(Group, { as : 'groups', through : 'user_groups', foreignKey : 'userId' });
    }
  ];

  /**
   * Attributes to remove before returning the model as JSON.
   * @property blacklist
   * @type     Array
   */
  model.blacklist = [ 'password', 'deletedAt' ];

  /**
   * A list of model methods.
   * @property methods
   * @type     Object
   */
  model.methods = {

    /**
     * Returns the users full name.
     * @return {String}
     */
    name() {
      return this.firstName + ' ' + this.lastName;
    },

    // ### Role Methods
    // A batch of methods that can determine the users access rights.

    /**
     * Returns a boolean value if the user is an administrator.
     * @return {Boolean}
     */
    isAdmin() {
      return this.role === 'admin';
    },

    /**
     * Checks if the user has access based on the provided role.
     * @param  {String}  role
     * @return {Boolean}
     */
    hasAccess(role) {
      let roles      = getRoles();
      let checkIndex = roles.indexOf(role);
      let authIndex  = roles.indexOf(this.role);

      // ### Access Check
      // If provided role is less than authenticated role we have access.

      return checkIndex < authIndex;
    }

  };

  /**
   * Returns a list of available roles.
   * @return {Array}
   */
  function getRoles() {
    let roles = Bento.config.roles;
    if (!roles) {
      throw error.parse({
        code     : `MISSING_ROLES_CONFIG`,
        message  : `Missing required roles configuration.`,
        solution : `Make sure you have defined roles array in ./config/api/*.js`
      });
    }
    return roles;
  }

  return model;

});
