'use strict';

import React           from 'react';
import { logger }      from 'reach-react';
import { array, type } from 'reach-react/lib/helpers';
import ReactSelect     from 'react-select';

export default class Select extends React.Component {

  /**
   * Only update the component if the input value has changed.
   *
   * TODO: Need to create a robust update check!
   *
   * @method shouldComponentUpdate
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {
    let prev, next;

    // ### Connector
    // If selector is basing itself on a connector we need to make special value checks.

    if (this.isConnector(this.props)) {
      if (this.didConnectorUpdate(this.props, nextProps)) {
        this.reset();
      }
      return true;
    }

    // ### Value Checks

    prev = this.props.value;
    next = nextProps.value;
    if (next !== prev) {
      return true;
    }

    return false;
  }

  /**
   * @method isConnector
   * @param  {Object} prev
   * @return {Boolean}
   */
  isConnector(prev) {
    return type.isPlainObject(prev.options.options);
  };

  /**
   * @method didConnectorUpdate
   * @param  {Object} prev
   * @param  {Object} next
   */
  didConnectorUpdate(prev, next) {
    let prevOpts = prev.options.options;
    let nextOpts = next.options.options;
    if (type.isPlainObject(prevOpts)) {
      let prevConnector = prev.value[prevOpts.connector];
      let nextConnector = next.value[nextOpts.connector];
      if (nextConnector !== prevConnector) {
        return true;
      }
    }
    return false;
  }

  /**
   * Resets the checkboxes populated.
   * @method reset
   */
  reset() {
    this.props.onChange({
      target : {
        type  : 'multi-select',
        name  : this.props.options.name,
        reset : true
      }
    });
  }

  /**
   * Sends input to the form state handler.
   * @method onChange
   * @param  {String} value
   * @param  {Object} options
   */
  onChange(value, options) {
    this.props.onChange({
      target : {
        type  : 'select',
        name  : this.props.options.name,
        value : this.props.multi ? (value ? value.split(',') : []) : value
      }
    });
  }

  /**
   * @method render
   * @return {Component}
   */
  render() {
    let { label, name, className, helpText, options } = this.props.options;
    let { value, multi }                              = this.props;

    // ### Dynamic Values

    if (type.isPlainObject(options)) {
      options = options.values[this.props.value[options.connector]];
      value   = value[name];
      if (!options) {
        return <div />
      }
    }

    // ### Debug

    logger.debug(`Form > Render select component [${ name }] [${ value }]`);

    return (
      <div className={ className || 'col-md-12' }>
        <label>{ label }</label>
        <ReactSelect
          name        = { name }
          value       = { value }
          options     = { options.map(
            (o) => {
              return { 
                label : o.name, 
                value : o.value 
              };
            })
          }
          onChange    = { this.onChange.bind(this) }
          multi       = { this.props.multi }
          placeholder = { helpText }
        />
      </div>
    );
  }

}