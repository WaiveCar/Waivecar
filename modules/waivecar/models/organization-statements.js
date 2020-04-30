Bento.Register.Model('OrganizationStatement', 'sequelize', function register(
  model,
  Sequelize,
) {
  model.table = 'organization_statements';

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
    billingDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    dueDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: 'outstanding',
    },
    paymentId: {
      type: Sequelize.INTEGER,
      defaultValue: null,
    },
    notes: {
      type: Sequelize.TEXT,
      defaultValue: null,
    },
  };

  model.relations = [
    'Shop/Order',
    'Organization',
    function(ShopOrder, Organization) {
      this.belongsTo(ShopOrder, {as: 'payment', foreignKey: 'paymentId'});
      this.belongsTo(Organization, {
        as: 'organization',
        foreignKey: 'organizationId',
      });
    },
  ];
  return model;
});
