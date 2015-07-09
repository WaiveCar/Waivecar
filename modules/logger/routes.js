/**
  Logger Routes
  =============

  @author  Christoffer Rødvik
  @license MIT
 */

'use strict';

var Router   = Reach.Router;
var ErrorLog = Reach.model('ErrorLog');

Router.get('/logger', {
  handler : function *(query) {
    return yield ErrorLog.find(query);
  }
});