'use strict';

Bento.Register.Model('ReportFile', 'sequelize', function(model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'report_files';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
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
