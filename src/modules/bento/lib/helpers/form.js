'use strict';

module.exports = class Form {

  /**
   * Extracts the data from form elements with a [name] attribute.
   * @param  {Object} event
   * @return {Void}
   */
  constructor(event) {
    this.data = {};
    for (let i = 0, len = event.target.length; i < len; i++) {
      let el = event.target[i];
      if (el.name) {
        this.data[el.name] = el.value;
      }
    }
    event.preventDefault();
  }

  /**
   * Assigns custom data to the form object.
   * @param  {Object} data
   * @return {Object}
   */
  assign(data) {
    this.data = Object.assign(this.data, data);
  }

};
