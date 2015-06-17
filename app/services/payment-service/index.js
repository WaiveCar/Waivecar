exports = module.exports = function(config, logger) {
     var stripe = require('stripe')(config.stripe.secretKey);

  var methods = {
    authorizePayment:function(amount,customerId,description,next){

          stripe.charges.create({
            amount: amount,
            currency: "usd",
            capture:false,
            customer:customerId,
            // source: "ANY_TOKEN!", // obtained with Stripe.js
            description: description
          }, next);
    },
    capturePayment:function(amount,chargeId,next){
      if(amount){
        stripe.charges.capture(chargeId,{amount:amount},next);
      }
      else{
        stripe.charges.capture(chargeId,next);
      }
    },
    updateCustomer:function(customerId,customerData,next){
        stripe.customers.update(customerId,customerData,next);
    },
    createCustomer:function(customerData,next){
        stripe.customers.create(customerData, function(err, customer) {
          if(err){
            next(err);
            return;
          }
          next(null,customer);
        });
    },
    retrieveBalance:function(next){
        stripe.balance.retrieve(next);
    },
    deleteCard:function(customerId,cardId,next){
      stripe.customers.deleteCard(customerId, cardId,next);
    }


  }
    // NB. tokens are issued client side, this method should only be used by server tests.
    // generateToken: function(model, next) {
    //   return stripe.tokens.create(model, next);
    // },

  //   upsertCustomer: function(model, next) {
  //     User.findById(model.user).exec(function(err, user) {
  //       if (err) return next(err);
  //       if (!user) return next(new Error('User not found'));

  //       var stripe = require('stripe')(config.stripe.secretKey);

  //       /*jshint camelcase: false */
  //       var stripeRequest = {
  //         description: user.id,
  //         email: user.email,
  //         card: {
  //           number: model.cardNumber,
  //           exp_month: model.expMonth,
  //           exp_year: model.expYear,
  //           cvc: model.cvc,
  //           name: model.billingName,
  //           address_line1: model.addressLine1,
  //           address_line2: model.addressLine2,
  //           address_city: model.city,
  //           address_zip: model.zip,
  //           address_state: model.state,
  //           address_country: model.country
  //         },
  //         metadata: {
  //           id: user.id,
  //           name: user.name
  //         }
  //       };

  //       if (user.customerId) {
  //         stripe.customers.update(user.customerId, stripeRequest, function(err, customer) {
  //           if (err) return next(err);
  //           if (!customer) return next(new Error('Customer not updated'));

  //           user.customerId = customer.id;
  //           user.cardReference = {
  //             id: customer.cards.data[0].id,
  //             number: '**** **** **** ' + customer.cards.data[0].last4,
  //             brand: customer.cards.data[0].brand,
  //             expMonth: customer.cards.data[0].exp_month,
  //             expYear: customer.cards.data[0].exp_year
  //           };

  //           user.save(next);
  //         });
  //       } else {
  //         stripe.customers.create(stripeRequest, function(err, customer) {
  //           if (err) return next(err);
  //           if (!customer) return next(new Error('Customer not created'));

  //           user.customerId = customer.id;
  //           user.cardReference = {
  //             id: customer.cards.data[0].id,
  //             number: '**** **** **** ' + customer.cards.data[0].last4,
  //             brand: customer.cards.data[0].brand,
  //             expMonth: customer.cards.data[0].exp_month,
  //             expYear: customer.cards.data[0].exp_year
  //           };

  //           user.save(next);
  //         });
  //       }
  //     });
  //   },

  //   removeCard: function(userId, next) {
  //     User.findById(userId).exec(function(err, user) {
  //       if (err) return next(err);
  //       if (!user) return next(new Error('User not found'));

  //       var stripe = require('stripe')(config.stripe.secretKey);
  //       stripe.customers.deleteCard(user.customerId, user.cardReference.id, function(err, result) {
  //         var isDeleted = (err && err.message && err.message.indexOf('There is no source with ID card') === 0) || (result && result.deleted);
  //         if (isDeleted) {
  //           user.cardReference = undefined;
  //           return user.save(next);
  //         } else {
  //           if (err) return next(err);
  //           return next(new Error(JSON.stringify(result)));
  //         }
  //       });
  //     });
  //   },

  //   processPledge: function(pledge, next) {
  //     if (!pledge.user.customerId) {
  //       return next();
  //     }

  //     var chargeRequest = {
  //       amount: pledge.amount * 100,
  //       currency: 'USD',
  //       customer: pledge.user.customerId,
  //       description: 'Backing ' + pledge.case.title,
  //       metadata: {
  //         user: pledge.user.id.toString(),
  //         'case': pledge.case.id.toString(),
  //         email: pledge.user.email
  //       },
  //       /*jshint camelcase: false */
  //       receipt_email: pledge.user.email
  //     };

  //     var stripe = require('stripe')(config.stripe.secretKey);
  //     stripe.charges.create(chargeRequest, function(err, charge) {
  //       if (err) {
  //         pledge.status = 'back-failed';
  //         pledge.statusReason = err.message;
  //       } else {
  //         pledge.status = 'backed';
  //       }

  //       pledge.stripeData = charge;
  //       pledge.save(next);
  //     });
  //   }

  // };

  return methods;
};

module.exports['@singleton'] = true;
module.exports['@require'] = [
  'igloo/settings',
  'igloo/logger'
];
