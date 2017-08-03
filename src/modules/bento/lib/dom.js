import config   from 'config';
import { type } from './helpers';

module.exports = class DOM {
  static setTitle(value, seperator = '|', isRaw = false) {
    document.title = value;
    //document.title = isRaw ? value : `${ config.app.name } ${ seperator } ${ value }`;
  }

  static hasClass(classes, className) {
    return classes.match(new RegExp(className, 'g'));
  }

  /**
   * Returns a new class string.
   * @param  {Object} options
   * @return {String}
   */
  static setClass(options) {
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
