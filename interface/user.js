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

    avatar : {
      type : Sequelize.STRING
    },

    status : {
      type         : Sequelize.ENUM('active', 'probation', 'pending', 'suspended', 'waitlist'),
      defaultValue : 'waitlist'
    },

    level: {
      type : Sequelize.ENUM('drainer','normal','charger','super-charger', 'gifted-charger'),
      defaultValue : null
    },

    sitTimeOutliers: {
      type: Sequelize.FLOAT,
      defaultValue: 0
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

    waiveworkCredit : {
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

    deviceToken : {
      type         : Sequelize.STRING,
      defaultValue : null
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
    },

    lastHoldAt : {
      type       : Sequelize.DATE
    },
  };

  model.attributes = [ 'email=>role', 'role=>group', 'group=>groupRole', 'tagList' ];

  model.relations = [
    'GroupUser',
    'InsuranceQuote',
    function(GroupUser, InsuranceQuote) {
      this.hasMany(GroupUser, { as: 'tagList', foreignKey: 'userId' });
      this.hasMany(InsuranceQuote, { as : 'insuranceQuote', foreignKey : 'userId'});
    }
  ];

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

    getCredit(useWorkCredit) {
      return `(credit: $${ ((useWorkCredit ? this.waiveworkCredit : this.credit) / 100).toFixed(2) })`;
    },

    // This is used mostly in slack messages ... it emits the users phone number 
    // in a non-stupid way.
    info() {
      return this.phone ? this.phone.replace(/^\+1(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : '';
    },

    *currentBooking() {
      let Booking = Bento.model('Booking');
      return yield Booking.findOne({
        where : {
          status : {
            $notIn : [ 'completed', 'closed', 'cancelled' ]
          },
          userId : this.id
        },
        include: [{
          model: 'BookingDetails',
          as: 'details'
        }],
        order : [
          [ 'created_at', 'DESC' ]
        ]
      });
    },

    *getLicense() {
      let License = Bento.model('License');
      return yield License.findOne(
        {where: {userId: this.id} },
        {order: [['id', 'DESC']]} 
      );
    },

    *age() {
      let moment  = require('moment');

      let userLicense = yield this.getLicense();
      if(!userLicense) {
        return 0;
      } 
      return moment().diff(moment(userLicense.birthDate), 'years');
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

    *getCard() {
      let Card = Bento.model('Shop/Card');

      return yield Card.findOne({ 
        where : { userId : this.id },
        order : [['updated_at', 'DESC']]
      });
    },

    *loadTagList() {
      if(!this.tagList) {
        let GroupUser = Bento.model('GroupUser');
        this.tagList = yield GroupUser.find({
          where: { userId: this.id },
          include: [
            {
              model: 'Group',
              as: 'group'
            },
            {
              model: 'GroupRole',
              as: 'group_role'
            }
          ]
        });
      }
      return this.tagList;
    },

    // the Type is things like "region" but it is NOT things like
    // "la" or "level". It returns things like *only* the region.
    *getTagList(type, field = 'name') {

      var tagList = yield this.loadTagList();

      function getTags(type) {
        let _tagList = type ? tagList.filter(row => row.group.name === type) : tagList;
        return _tagList.map(row => row.groupRole[field]);
      }

      if(Array.isArray(type)) {
        return Array.prototype.concat.apply([], type.map(getTags));
      }

      return getTags(type);
    },

    *getTag(tag) {
      return (yield this.loadTagList()).filter((row) => {
        return row.groupRole.name.toLowerCase() === tag.toLowerCase();
      });
    },

    *isTagged(tag) {
      return (yield this.getTag(tag)).length;
    },

    *hasTag(tag) {
      return (yield this.getTag(tag)).length;
    },

    *untag(tag) {
      let tagRecord = yield this.getTag(tag);
      if(tagRecord.length) {
        let GroupUser = Bento.model('GroupUser');
        yield GroupUser.destroy({where: {id: tagRecord[0].id} });
      }
    },

    *delTag(tag) {
      return yield this.untag(tag);
    },

    *addTag(tag) {
      let record = yield this.hasTag(tag);
      if(record) {
        return record;
      }
      let GroupRole = Bento.model('GroupRole');
      let groupRecord = yield GroupRole.findOne({where: {name: tag}});
      if(groupRecord) {
        let GroupUser = Bento.model('GroupUser');
        let tag = new GroupUser({
          userId: this.id,
          groupRoleId: groupRecord.id,
          groupId: groupRecord.groupId
        });
        yield tag.save();
      }    
    },

    *getFlag(what, fullRow = false) {
      let UserValues = Bento.model('UserValues');
      let existingRow = yield UserValues.findOne({where: {userId: this.id, key: what}});
      return existingRow ? (fullRow ? existingRow : existingRow.value) : null;
    },

    *incrFlag(what, value=1) {
      let existingRow = yield this.getFlag(what, true);

      if(!existingRow) {
        let UserValues = Bento.model('UserValues');
        let model = new UserValues({
          userId: this.id,
          key: what,
          value: value
        });
        yield model.save();
        return value;
      }

      let newValue = existingRow.value + value;
      if(isNaN(newValue)) {
        newValue = existingRow.value || value || 0;
      }

      yield existingRow.update({
        ttl: existingRow.ttl + 1,
        value: newValue
      });

      return newValue; 
    },

    isAdmin() {
      return this.hasAccess('admin');
    },

    isSuperAdmin() {
      return this.hasAccess('super');
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
    },

    *getOrganizations() {
      let OrganizationUser = Bento.model('OrganizationUser');
      return yield OrganizationUser.find({
        where: {
          userId: this.id,
        },
        include: [
          {
            model: 'Organization',
            as: 'organization',
          },
        ],
      });
    },

  };

  return model;

});
