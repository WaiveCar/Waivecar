import React      from 'react';
import { logger } from 'bento';

export default class Textarea extends React.Component {

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
    let { label, name, placeholder, className } = this.props.options;
    logger.debug(`Form > Render textarea component [${ name }] [${ this.props.value }]`);
    return (
      <div className={ className || 'col-md-12' }>
        <label>{ label }</label>
        <textarea
          className   = "form-control"
          name        = { name }
          placeholder = { placeholder }
          value       = { this.props.value }
          onChange    = { this.props.onChange }
        />
      </div>
    );
  }

}