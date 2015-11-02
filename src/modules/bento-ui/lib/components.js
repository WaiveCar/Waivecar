import React       from 'react';
import resources   from './resources';
import fields      from './fields';

class Components {

  constructor() {
    this.store = {};
  }

  /**
   * Registers a new component.
   * @param  {Object} component
   */
  register(component) {
    this.store[component.type] = component;
  }

  /**
   * Retrieves a component from the store based on provided type.
   * @param  {String} type
   * @return {Object}
   */
  get(type) {
    return this.store[type];
  }

  /**
   * Returns all components in the store.
   * @return {Array}
   */
  getAll() {
    let map = [];
    for (let key in this.store) {
      map.push({
        category : 'Component',
        accepts  : [ 'Component' ],
        ...this.store[key]
      });
    }
    return map.sort((a, b) => { return a.order > b.order });
  }

  /**
   * Returns all the options for the provided component type.
   * @param  {String} type
   * @return {Array}
   */
  getOptions(type) {
    let component = this.get(type);
    if (!component) {
      return console.error(`Reach UI > Invalid component requested [${ type }]`);
    }
    return component.options || [];
  }

  /**
   * Returns a renderable react component.
   * @param  {String} type
   * @param  {Object} props
   * @return {Object}
   */
  render(type, props) {
    let component = this.get(type);
    if (!component) {
      return console.error(`Reach UI > Invalid component requested [${ type }]`);
    }
    let Component = component.class;
    return <Component { ...props } />
  }

}

module.exports = new Components();