Bento.Register.Model('OrganizationCard', 'sequelize', (model, Sequelize) => {
  model.table = 'organization_cards';

  model.schema = {
    organizationId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
    },
    shop_payment_card_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  };

  model.attributes = [];

  model.relations = [
    'Shop/Card',
    function (ShopCard) {
      this.belongsTo(ShopCard, {as: 'card', foreignKey: 'shopPaymentCardId'});
    },
  ];

  return model;
});
