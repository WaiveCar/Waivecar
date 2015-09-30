'use strict';

import React       from 'react';
import { logger }  from 'reach-react';
import ReactSelect from 'react-select';

export default class Select extends React.Component {

  /**
   * Only update the component if the input value has changed.
   * @method shouldComponentUpdate
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {
    let prev = this.props.value;
    let next = nextProps.value;
    if (next !== prev) {
      return true;
    }
    return false;
  }

  /**
   * Sends input to the form state handler.
   * @method onChange
   * @param  {String} newValue
   * @param  {Object} selectedOptions
   */
  onChange(newValue, selectedOptions) {
    this.props.onChange({
      target : {
        type  : 'select',
        name  : this.props.options.name,
        value : this.props.multi ? (newValue ? newValue.split(',') : []) : newValue
      }
    });
  }

  /**
   * @method render
   * @return {Component}
   */
  render() {
    let { label, name, className, helpText, options } = this.props.options;
    logger.debug(`Form > Render select component [${ name }] [${ this.props.value }]`);
    return (
      <div className={ className || 'col-md-12' }>
        <label>{ label }</label>
        <ReactSelect
          name        = { name }
          value       = { this.props.value }
          options     = { options.map((o) => { return { label : o.name, value : o.value }; }) }
          onChange    = { this.onChange.bind(this) }
          multi       = { this.props.multi }
          placeholder = { helpText }
        />
      </div>
    );
  }

}