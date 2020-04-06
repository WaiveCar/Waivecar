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
  return model;
});
