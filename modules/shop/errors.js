'use strict';

let changeCase = Bento.Helpers.Case;

// ### Order Errors

Bento.Error.handler([
  'POST /shop/orders'
], (err) => {
  console.log(err);
  return err;
});

// ### Product Errors

Bento.Error.handler([
  'POST /shop/items',
  'PUT  /shop/items/:id'
], (err) => {
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    err.status  = 400;
    err.code    = `SHOP_INVALID_CATEGORY`;
    err.message = `The category id provided does not exist.`;
  }
  return err;
});

// ### Cart Errors

Bento.Error.handler([
  'PUT /shop/carts/save/:id'
], (err) => {
  switch (err.name) {
    case 'SequelizeForeignKeyConstraintError' : {
      err.status  = 400;
      err.code    = `SHOP_CART_INVALID_USER`;
      err.message = `The user being assigned to this cart does not exist.`;
      break;
    };
    case 'SequelizeUniqueConstraintError' : {
      err.status  = 400;
      err.code    = `SHOP_CART_DUPLICATE`;
      err.message = `This shopping cart has already been saved.`;
      break;
    };
  }
  return err;
});

// ### Payment Card Errors

Bento.Error.handler([
  'POST /shop/cards',
  'GET  /shop/cards',
  'GET  /shop/cards/:id',
  'PUT  /shop/cards/:id'
], (err) => {
  if (err.type === 'StripeCardError' || err.type === 'StripeInvalidRequest') {
    err.status = 400;
    err.code   = changeCase.toUpper(changeCase.toSnake(err.type));
  }
  return err;
});


