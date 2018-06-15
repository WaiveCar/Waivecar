'use strict';

Bento.Register.Model('Shop/Order', 'sequelize', (model, Sequelize) => {

  /**
   * The identity of the table created in your database.
   * @property table
   * @type     String
   */
  model.table = 'shop_orders';

  /**
   * The sequelize schema definition of your model.
   * @property schema
   * @type     Object
   */
  model.schema = {

    /**
     * The id of the user that the order is attached to.
     * @type {Integer}
     */
    userId : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    /**
     * The status presented from the local database is juat a simple presentation layer
     * of the entire order object. To view the order/payment in detail you must request
     * the object from the service that the order was placed with.
     * @type {Enum}
     */
    status : {
      type : Sequelize.ENUM(
        'pending',    // Order is currently pending charge.
        'authorized', // Order has been authorized from two-step payment.
        'paid',       // Order was successfully completed.
        'refunded',   // Order has been fully, or partially refunded.
        'failed',     // Order has failed.
        'cancelled'
      ),
      defaultValue : 'pending'
    },

    /**
     * The payment source, this is a temporary card token or stored payment card.
     * @type {String}
     */
    source : {
      type : Sequelize.STRING
    },

    /**
     * The service used to process the order and collect payment.
     * @type {Enum}
     */
    service : {
      type : Sequelize.ENUM('stripe')
    },

    /**
     * The id returned from the service used to collect payment.
     * @type {String}
     */
    chargeId : {
      type : Sequelize.STRING
    },

    /**
     * The order description usually provided by the customer.
     * @type {Text}
     */
    description : {
      type : Sequelize.TEXT
    },

    /**
     * The order metadata.
     * @type {Text}
     */
    metadata : {
      type : Sequelize.TEXT,
      set  : function setMetadata(val) {
        this.setDataValue('metadata', JSON.stringify(val));
      }
    },

    /**
     * The currency used for this order.
     * @type {String}
     */
    currency : {
      type      : Sequelize.STRING(12),
      allowNull : false
    },

    /**
     * The total amount charged on the order.
     * @type {Integer}
     */
    amount : {
      type      : Sequelize.INTEGER,
      allowNull : false
    },

    /**
     * The total amount refunded on this order.
     * @type {Integer}
     */
    refunded : {
      type         : Sequelize.INTEGER,
      defaultValue : 0
    },

    /**
     * The user that created the order, this is usually the customer but could be a
     * system administrator creating a order on the users behalf.
     * @type {Integer}
     */
    createdBy : {
      type       : Sequelize.INTEGER,
      allowNull  : false,
      references : {
        model : 'users',
        key   : 'id'
      }
    },

    /**
     * The last user that touched|updated the order.
     * @type {Integer}
     */
    updatedBy : {
      type       : Sequelize.INTEGER,
      references : {
        model : 'users',
        key   : 'id'
      }
    }

  };

  model.attributes = [
    'description=>items'
  ];

  return model;

});
