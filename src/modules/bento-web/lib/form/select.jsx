import React                           from 'react';
import { helpers, logger, api, relay } from 'bento';
import ReactSelect                     from 'react-select';
import { resources }                   from 'bento-ui';

let { array, type } = helpers;

module.exports = class Select extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    if (this.isLookup(this.props)) {
      let options = this.props.options.options;
      let { index } = resources.get(options.lookup);
      // TODO: it would be nice to not have to hit the API each time..
      // shouldn't the store already have items?
      api.get(index.uri, (error, data) => {
        relay.subscribe(this, options.lookup);
        relay.dispatch(options.lookup, {
          type : 'index',
          data : data
        });
      }.bind(this));
    }
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
      }
      return true;
    }

    if (this.isLookup(this.props)) {
      // TODO: for now, always update.
      return true;
    }

    // ### Value Checks

    name = this.props.options.name;
    prev = this.props.value;
    next = nextProps.value;
    if (this.props.multi) {
      prev = prev[name];
      next = next[name];
    }

    if (next !== prev) {
      return true;
    }

    return false;
  }

  /**
   * @method isLookup
   * @param  {Object} props
   * @return {Boolean}
   */
  isLookup(props) {
    if (!props) return;
    return type.isPlainObject(props.options.options) && props.options.options.lookup;
  };

  /**
   * @method isConnector
   * @param  {Object} props
   * @return {Boolean}
   */
  isConnector(props) {
    return type.isPlainObject(props.options.options) && props.options.options.connector;
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
   * Determines Options source and populates an array with expected values.
   * @return {Array} Array with { label, value } objects
   */
  getOptions() {
    let { options } = this.props.options;
    let mapNameToLabel = (item) => {
      return {
        label : item.name,
        value : item.value
      }
    };

    if (this.isLookup(this.props) && this.state[options.lookup]) {
      return this.state[options.lookup].map((item) => {
        return {
          label : item[options.name],
          value : item[options.value]
        }
      });
    } else if (this.isConnector(this.props)) {
      if (!this.props.value || !this.props.value[options.connector]) {
        return [];
      }
      let items = options.values[this.props.value[options.connector]];
      return items.map(mapNameToLabel);
    } else if (type.isPlainObject(options)) {
      return [];
    } else if (Array.isArray(options)) {
      return options.map(mapNameToLabel);
    }
  }

  /**
   * @method render
   * @return {Component}
   */
  render() {
    let { label, name, className, helpText } = this.props.options;
    let { value, multi } = this.props;
    let options = this.getOptions();

    if (!options) {
      return <div />
    }

    value = value[name];

    logger.debug(`Form > Render select component [${ name }] [${ value }]`);

    className = className || 'col-md-12';
    let isDefined = !(value === undefined || value === null);
    if (isDefined) {
      className = className + ' active';
    }

    return (
      <div className={ className }>
        <label>{ label }</label>
        <ReactSelect
          name        = { name }
          value       = { value }
          options     = { options }
          onChange    = { this.onChange.bind(this) }
          multi       = { this.props.multi }
          placeholder = { helpText }
        />
      </div>
    );
  }

}
