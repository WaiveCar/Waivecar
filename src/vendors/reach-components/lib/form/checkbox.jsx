'use strict';

import React      from 'react';
import { logger } from 'reach-react';
import { array }  from 'reach-react/lib/helpers';

export default class Checkbox extends React.Component {

  /**
   * Only update the component if the input value has changed.
   * @method shouldComponentUpdate
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {

    // ### Length
    // First we do an optimize length check, if the lengths do not match
    // we render the component.

    let prevOptions = this.props.options.options;
    let nextOptions = nextProps.options.options;
    if (nextOptions.length !== prevOptions.length) {
      return true;
    }

    // ### Compare
    // Compare the values in each checkbox, if the arrays do not match
    // we render the component.

    let prevValues = prevOptions.map((opt) => { return this.props.value[opt.value] }.bind(this));
    let nextValues = prevOptions.map((opt) => { return nextProps.value[opt.value] }.bind(this));
    if (!array.equals(nextValues, prevValues)) {
      return true;
    }

    return false;
  }

  /**
   * @method label
   */
  label() {
    let { label } = this.props.options;
    if (label) {
      return <label className="col-xs-12">{ label }</label>
    }
  }

  /**
   * @method render
   * @return {Component}
   */
  render() {
    let { name, className, options } = this.props.options;
    logger.debug(`Form > Render checkbox component [${ name }] [${ options.map((opt) => `${opt.value}=${this.props.value[opt.value]}`) }]`);
    return (
      <div className="form-group row">
        { this.label() }
        {
          options.map((box, index) => {
            return (
              <div key={ index } className={ className || 'col-md-12' }>
                <div className="checkbox">
                  <label>
                    <input type="checkbox" name={ box.value } onChange={ this.props.onChange } checked={ this.props.value[box.value] } /> { box.name }
                  </label>
                </div>
              </div>
            )
          })
        }
      </div>
    );
  }

}