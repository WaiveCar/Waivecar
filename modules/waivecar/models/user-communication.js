Bento.Register.Model('UserCommunication', 'sequelize', function(
  model,
  Sequelize,
) {
  model.table = 'user_communications';

  model.schema = {
    id: {
      type: Sequelize.STRING(28),
      primaryKey: true,
    },

    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    creatorId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    type: {
      type: Sequelize.ENUM('sms', 'email'),
      defaultValue: 'sms',
    },

    content: {
      type: Sequelize.TEXT,
    },
  };

  model.relations = [
    'User',
    function(User) {
      this.belongsTo(User, {as: 'user', foreignKey: 'userId'});
      this.belongsTo(User, {as: 'creator', foreignKey: 'creatorId'});
    },
  ];

  return model;
});
