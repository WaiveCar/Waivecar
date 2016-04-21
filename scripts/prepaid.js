#!/usr/bin/env node
'use strict';

require('bentojs-api');
let fs = require('fs');
let csv = require('csv-write-stream');
let co = require('co');
let stripe = Bento.module('shop/lib/stripe');

co(function *() {
  yield Bento._bootstrap();

  let Card = Bento.model('Shop/Card');
  let prepaid = [];

  // Collect all cards linked with user
  let cards = yield Card.find({
    include : [
      {
        model : 'User',
        as    : 'user'
      }
    ]
  });

  // Fetch each card from stripe, determine if it is prepaid
  for (let i = 0, len = cards.length; i < len; i++) {
    let card = cards[i];
    let stripecard = yield stripe.cards.show(card.user.stripeId, card.id);
    if (stripecard.funding === 'prepaid') prepaid.push(card);
  }

  console.log(`Removing ${ prepaid.length } prepaid cards.`);

  // Remove each prepaid card
  for (let i = 0, len = prepaid.length; i < len; i++) {
    let card = prepaid[i];
    yield card.delete();
    card.relay('delete');
  }

  if (prepaid.length) {
    yield write(prepaid);
    console.log(`See list of cards / users in prepaid_users.csv`);
  }


  process.exit(0);
});


function *write(cards) {
  return yield new Promise((resolve, reject) => {
    let writer = csv({ headers : [ 'id', 'cardId', 'firstName', 'lastName', 'phone', 'email' ] });
    let fileStream = fs.createWriteStream('prepaid_users.csv');

    writer.pipe(fileStream);
    for (let i = 0, len = cards.length; i < len; i++) {
      let card = cards[i];
      writer.write([
        card.user.id,
        card.id,
        card.user.firstName,
        card.user.lastName,
        card.user.phone,
        card.user.email
      ]);
    }
    writer.end();

    fileStream.on('finish', () => {
      resolve();
    });
  });
}
