'use strict';

Bento.Register.Model('Tag', 'sequelize', function(model, Sequelize) {
  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'tags';
  
  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {
    name: {
      type       : Sequelize.STRING(45)
    }
  };
  
  model.relations = [
    function() {
    }
  ];
  
  return model;
  
});
