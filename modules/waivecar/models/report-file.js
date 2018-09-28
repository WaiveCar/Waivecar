'use strict';

Bento.Register.Model('ReportFile', 'sequelize', function(model, Sequelize) {

  model.table = 'report_files';

  model.schema = {

    reportId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'reports',
        key   : 'id'
      }
    },

    fileId : {
      type       : Sequelize.STRING,
      allowNull  : false,
      references : {
        model : 'files',
        key   : 'id'
      }
    }

  };

  model.relations = [
    'File',
    function relations(File) {
      this.belongsTo(File, {foreignKey : 'fileId', as : 'details'});
    }
  ];

  return model;
});
