'use strict';

Bento.Register.Model('Report', 'sequelize', function(model, Sequelize) {

  model.table = 'reports';

  model.schema = {

    bookingId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'bookings',
        key   : 'id'
      }
    },

    description : {
      type : Sequelize.TEXT
    },

    fileId : {
      type       : Sequelize.STRING,
      allowNull  : false,
      references : {
        model : 'files',
        key   : 'id'
      }
    },

    type :{
      type      : Sequelize.ENUM,
      values    : ['left','right','front','rear','other'],
      allowNull : true
    },

    createdBy : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    }

  };

  model.relations = [
    'File',
    function relations(File) {
      this.belongsTo(File, { foreignKey: 'fileId', as: 'file'});
    }
  ];

  return model;
});
