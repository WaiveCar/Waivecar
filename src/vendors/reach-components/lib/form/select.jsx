'use strict';

import React      from 'react';
import { logger } from 'reach-react';

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
   * @method render
   * @return {Component}
   */
  render() {
    let { label, name, className, options } = this.props.options;
    logger.debug(`Form > Render select component [${ name }] [${ this.props.value }]`);
    return (
      <div className={ className || 'col-md-12' }>
        <label>{ label }</label>
        <select className="form-control" name={ name } value={ this.props.value } onChange={ this.props.onChange }>
          {
            options.map((option, i) => {
              return <option key={ i } value={ option.value }>{ option.label }</option>
            })
          }
        </select>
      </div>
    );
  }

}