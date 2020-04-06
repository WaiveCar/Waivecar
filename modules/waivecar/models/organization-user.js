Bento.Register.Model('OrganizationUser', 'sequelize', function register(
  model,
  Sequelize,
) {
  model.table = 'organization_users';

  model.schema = {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    organizationId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  };

  model.relations = [
    'Organization',
    'User',
    function(Organization, User) {
      this.belongsTo(Organiation, {as: 'organization', foreignKey: 'organizationId'});
      this.belongsTo(User, { as : 'user', foreignKey : 'userId' });
    }
  ];
  return model;
});
