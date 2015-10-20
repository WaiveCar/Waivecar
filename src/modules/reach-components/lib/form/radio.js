'use strict';

import React      from 'react';
import { logger } from 'reach-react';
import { array }  from 'reach-react/lib/helpers';

export default class Radio extends React.Component {

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
   * @method checked
   * @param  {Mixed} value
   * @param  {Mixed} radio
   * @return {Boolean}
   */
  checked(value, radio) {
    if (!value || !radio) {
      return false;
    }
    if (value.toString() === radio.toString()) {
      return true;
    }
    return false;
  }

  /**
   * @method render
   * @return {Component}
   */
  render() {
    let { label, name, className, options } = this.props.options;
    let currentValue = this.props.value ? this.props.value : this.props.options.default;
    logger.debug(`Form > Render radio component [${ name }] [${ currentValue }]`);
    return (
      <div className="form-group row">
        <label className="col-xs-12">{ label }</label>
        {
          options.map((radio, index) => {
            return (
              <div key={ index } className={ className || 'col-md-12' }>
                <div className="radio">
                  <label>
                    <input type="radio" name={ name } value={ radio.value } onChange={ this.props.onChange } checked={ this.checked(currentValue, radio.value) } /> { radio.name }
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