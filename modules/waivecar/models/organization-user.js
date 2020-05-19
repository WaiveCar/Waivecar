Bento.Register.Model('OrganizationUser', 'sequelize', function register(
  model,
  Sequelize,
) {
  model.table = 'organization_users';

  model.schema = {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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

  model.attributes = ['organization', 'organizationStatements', 'logo'];

  model.relations = [
    'Organization',
    'User',
    function(Organization, User) {
      this.belongsTo(Organization, {
        as: 'organization',
        foreignKey: 'organizationId',
      });
      this.belongsTo(User, {as: 'user', foreignKey: 'userId'});
    },
  ];
  return model;
});
