Bento.Register.Model('InsuranceQuote', 'sequelize', function(
  model,
  Sequelize,
) {
  model.table = 'insurance_quotes';

  model.schema = {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    waitlistId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'waitlist',
        key: 'id',
      },
    },

    amount: {
      type: Sequelize.INTEGER,
      allowNull: true,
      default: null,
    },

    weeklyPayment: {
      type: Sequelize.INTEGER,
      allowNull: true,
      default: null,
    },

    accepted: {
      type: Sequelize.BOOLEAN,
      default: false,
    },

    priority: {
      type: Sequelize.INTEGER,
      allowNull: true,
      default: null,
    },

    expiresAt: {
      type: Sequelize.DATE,
      default: null,
    },
  };

  model.relations = [
    'User',
    'Waitlist',
    function relations(User, Waitlist) {
      this.belongsTo(User, {as: 'user', foreignKey: 'userId'});
      this.belongsTo(Waitlist, {as: 'waitlist', foreignKey: 'waitlistId'});
    },
  ];

  return model;
});
