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

    accoutType : {
      type       : Sequelize.STRING(16),
      defaultValue : 'normal'
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
    }
  };

  model.attributes = [
    'user'
  ];

  model.relations = [
    'User',
    function(User, Car) {
      this.belongsTo(User, { as : 'user', foreignKey : 'userId' });
    }
  ];

  return model;
});
