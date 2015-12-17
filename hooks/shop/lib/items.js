'use strict';

let fees     = require('./item-fees.js');
let Category = Bento.model('Shop/Category');
let Item     = Bento.model('Shop/Item');
let log      = Bento.Log;

module.exports = class Items {

  /**
   * Loads default shop items for waivecar.
   * @return {Void}
   */
  static *default() {
    let count = yield Item.count();
    if (!count) {
      log.info(`Shop Fees : No items registered, inserting default items.`);

      // ### Ensure Category

      let category = new Category({
        name : 'Fees'
      });
      yield category.save();

      // ### Create Items

      for (let i = 0, len = fees.length; i < len; i++) {
        let item = new Item({
          categoryId  : category.id,
          name        : fees[i].name,
          description : fees[i].description,
          price       : fees[i].price
        });
        yield item.save();
      }
    }
  }

};
