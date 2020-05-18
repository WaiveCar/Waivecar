import React               from 'react';
import { helpers, logger } from 'bento';
import TCheckbox           from 'react-toolbox/lib/checkbox';

let { array, type } = helpers;

module.exports = class Checkbox extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.onChange = this.onChange.bind(this);
  }

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
        return true;
      }
    }

    // ### Values
    // Check if the values has changed.

    prev = this.props.value[this.props.options.name];
    next = nextProps.value[this.props.options.name];
    if (!prev || !next || prev.length !== next.length || !array.equals(prev, next)) {
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
        type     : 'checkbox',
        category : this.props.options.name,
        reset    : true
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
        type  : 'checkbox',
        name  : this.props.options.name,
        value : value
      }
    });
  }


  /**
   * @method render
   * @return {Component}
   */
  render() {
    let { name, label, className } = this.props.options;
    let checked = this.props.value[name];

    // ### Debug
    logger.debug(`Form > Render checkbox component [${ name }] [${ this.props.value[name] }]`);
    return (
      <div className="form-group row">
        <div className={ className || 'col-md-12' }>
          <TCheckbox
            name      = { name }
            label     = { label }
            checked   = { checked }
            onChange  = { this.onChange }
          />
        </div>
      </div>
    );
  }

}
