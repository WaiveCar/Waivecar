'use strict';

let hooks = Bento.Hooks;

module.exports = function *() {
  yield hooks.call('shop:bootstrap');
};
