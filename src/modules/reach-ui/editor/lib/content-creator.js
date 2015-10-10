'use strict';

import { api }   from 'reach-react';
import resources from '../../lib/resources';

/**
 * @class ContentCreator
 */
let ContentCreator = module.exports = {};

/**
 * @param  {Object}
 * @param  {Function}
 * @return {Mixed}
 */
ContentCreator.createContentOrReturn = function(viewComponent, next) {
  if (viewComponent.type === 'content') {
    if (!viewComponent.options) {
      viewComponent.options = {};
    }
    if (!viewComponent.options.id) {
      let resource = resources.get('contents').store;
      let method = resource.method.toLowerCase();
      let action = resource.uri;
      api[method](action, { html : '<p>Awaiting Text</p>' }, function(err, res) {
        viewComponent.options = { id : res.id };
        return next(err, viewComponent);
      });
    } else {
      return next(null, viewComponent);
    }
  } else {
    return next(null, viewComponent);
  }
}
