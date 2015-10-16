'use strict';

import { type } from 'reach-react/lib/helpers';

class DOM {

  /**
   * Returns boolean value of class state.
   * @param  {String}  classes
   * @param  {String}  className
   * @return {Boolean}
   */
  hasClass(classes, className) {
    return classes.match(new RegExp(className, 'g'));
  }

  /**
   * Returns a new class string.
   * @param  {Object} options
   * @return {String}
   */
  setClass(options) {
    let result = [];
    for (let key in options) {
      let name = options[key];
      if (type.isBoolean(name) && name) {
        result.push(key);
      } else if (type.isString(name)) {
        result.push(name);
      }
    }
    return result.join(' ');
  }  

}

module.exports = new DOM();