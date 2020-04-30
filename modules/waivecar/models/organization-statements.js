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
    'Organization',
    'Shop/Order',
    function(Organization, ShopOrder) {
      this.belongsTo({model: Organization, as: 'organization'});
      this.belongsTo({model: ShopOrder, as: 'payment'});
    },
  ];
  return model;
});
