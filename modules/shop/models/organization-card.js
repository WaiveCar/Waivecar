Bento.Register.Model('OrganzationCard', 'sequelize', (model, Sequelize) => {
  model.table = 'organization_cards';

  model.schema = {
    organizationId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'organizations',
        key   : 'id'
      }
    },
    cardId : {
      type      : Sequelize.INTEGER,
      allowNull : false
    }
  };
  

  model.attributes = [
  ];

  model.relations = [
    'Shop/Card',
    function(ShopCard) {
      this.hasMany(ShopCard, { as : 'cards'});
    }
  ];
 
  return model;

});
