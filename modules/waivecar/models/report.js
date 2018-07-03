'use strict';

Bento.Register.Model('Report', 'sequelize', function(model, Sequelize) {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'reports';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    /**
     * The booking to attach the report to.
     * @type {Integer}
     */
    bookingId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'bookings',
        key   : 'id'
      }
    },

    /**
     * Report text.
     * @type {Text}
     */
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
    /**
     * Logs the user that created the report.
     * @type {Integer}
     */
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
    'ReportFile',
    function relations(ReportFile) {
      this.hasMany(ReportFile, { as : 'files',  foreignKey : 'reportId' });
    }
  ];

  return model;

});
