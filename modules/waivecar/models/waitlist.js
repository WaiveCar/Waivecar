'use strict';

Bento.Register.Model('Waitlist', 'sequelize', function(model, Sequelize) {
  model.table = 'waitlist';

  model.schema = {

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
      //
      // People signing up multiple times to the
      // waitlist is information that we should use
      // somehow.
      //
      // unique : true
    },

    password : { 
      type   : Sequelize.STRING(64)
    },

    latitude : {
      type : Sequelize.DECIMAL(10, 8),
    },

    longitude : {
      type : Sequelize.DECIMAL(11, 8),
    },

    placeId : {
      type : Sequelize.STRING(32),
    },

    placeName : {
      type : Sequelize.STRING(128),
    },

    facebook : {
      type : Sequelize.STRING(256),
    },

    priority : {
      type         : Sequelize.INTEGER,
      defaultValue : 0
    },

    userId : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    accountType : {
      type       : Sequelize.STRING(16),
      defaultValue : 'normal'
    },

    status :{
      type      : Sequelize.ENUM,
      values    : ['pending', 'accepted', 'rejected', 'incomplete', 'nonmarket', 'archived'],
      default: 'pending'
    },
      
    phone : {
      type       : Sequelize.STRING(32),
    },

    signupCount : {
      type       : Sequelize.INTEGER,
    },

    experience : {
      type       : Sequelize.INTEGER,
    },

    hours : {
      type       : Sequelize.INTEGER,
    },

    days : {
      type       : Sequelize.INTEGER,
    },

    notes : {
      type       : Sequelize.TEXT
    }
  };

  model.attributes = [
    'user'
  ];

  model.relations = [
    'User',
    'InsuranceQuote',
    function(User, InsuranceQuote) {
      this.belongsTo(User, { as : 'user', foreignKey : 'userId' });
      this.hasMany(InsuranceQuote, { as : 'insuranceQuote', foreignKey : 'waitlistId'});
    }
  ];

  return model;
});
