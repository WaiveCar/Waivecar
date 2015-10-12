'use strict';

import React                  from 'react';
import { logger, api, relay } from 'reach-react';
import { array, type }        from 'reach-react/lib/helpers';
import Select                 from 'react-select';
import resources              from 'reach-ui/lib/resources';
//TODO: why couldn't I go { resources } from 'reach-ui'; ???

export default class ReactSelect extends React.Component {

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
   * @method render
   * @return {Component}
   */
  render() {
    let { label, name, className, helpText, options } = this.props.options;
    let { value, multi }                              = this.props;

    // ### Dynamic Values
    //
    if (this.isLookup(this.props) && this.state[options.lookup]) {
      options = this.state[options.lookup].map((item) => {
        return {
          label  : item[options.name],
          value : item[options.value]
        }
      });
    } else if (this.isConnector(this.props)) {
      options = options.values[this.props.value[options.connector]];
      options = options.map((o) => {
        return {
          label : o.name,
          value : o.value
        };
      }) ;
    } else if (type.isPlainObject(options)) {
      return <div />
    } else if (Array.isArray(options)) {
      options = options.map((o) => {
        return {
          label : o.name,
          value : o.value
        };
      });
    }

    if (!options) {
      return <div />
    }

    if (multi) {
      value = value[name];
    }

    // ### Debug

    logger.debug(`Form > Render select component [${ name }] [${ value }]`);

    return (
      <div className={ className || 'col-md-12' }>
        <label>{ label }</label>
        <Select
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