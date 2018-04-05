'use strict';
var _ = require('lodash');

module.exports = class Form {

  initialize(key) {
    if(key.indexOf('[]') !== -1) {
      key = key.slice(0,-2);
      if(!_.isArray(this.data[key])) {
        this.data[key] = [];
      }
    }
  }

  addValue(key, value) {
    // if we are using the classic PHP style naming convention
    // for arrays then make sure we do this in an array 
    if(key.indexOf('[]') !== -1) {
      key = key.slice(0,-2);
      return this.data[key].push(value);
    } 
    this.data[key] = value;
  }

  constructor(event) {
    this.data = {};
    for (let i = 0, len = event.target.length; i < len; i++) {
      let el      = event.target[i];
      let isCheck = [ 'radio', 'checkbox' ].indexOf(el.type) > -1;

      this.initialize(el.name);

      if (el.name && !isCheck) {
        this.addValue(el.name, el.value);
      } else if (isCheck && el.checked) {
        this.addValue(el.name, el.value);
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
