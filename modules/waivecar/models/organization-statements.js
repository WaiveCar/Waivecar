Bento.Register.Model('OrganizationPayments', 'sequelize', function register(
  model,
  Sequelize,
) {
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
  return model;
});
