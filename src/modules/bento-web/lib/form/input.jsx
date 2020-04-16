import React                    from 'react';
import { dom, helpers, logger } from 'bento';

let { type } = helpers;

module.exports = class Input extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.hasFocus = false;
    this.state    = {
      className : null
    };
    this.focus = this.focus.bind(this);
    this.blur  = this.blur.bind(this);
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    this.setState({
      className : this.className()
    });
  }

  /**
   * Only update the component if the input value has changed.
   * @method shouldComponentUpdate
   * @param  {Object} nextProps
   * @param  {Object} nextState
   * @return {Boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {
    let prev, next;

    // ### Class
    // Check if class has changed.

    prev = this.state.className;
    next = nextState.className;
    if (next !== prev) {
      return true;
    }

    // ### Value
    // Check if value has changed.

    prev = this.props.value;
    next = nextProps.value;
    if (next !== prev) {
      return true;
    }

    return false;
  }

  /**
   * @method componentWillUpdate
   */
  componentWillUpdate(nextProps, nextState) {
    this.setState({
      className : this.className(nextProps.value)
    });
  }

  /**
   * @method class
   * @return {String}
   */
  className(value) {
    return dom.setClass({
      column : this.props.options.className || 'col-md-12',
      active : !(value === undefined || value === null),
      focus  : this.hasFocus
    });
  }

  /**
   * @method focus
   */
  focus() {
    this.hasFocus = true;
    this.setState({
      className : this.className(this.props.value)
    });
  }

  /**
   * @method blur
   */
  blur() {
    this.hasFocus = false;
    this.setState({
      className : this.className(this.props.value)
    });
  }

  /**
   * @method render
   * @return {Component}
   */
  render() {
    let { label, name, type, placeholder, helpText, tabIndex, required } = this.props.options;
    logger.debug(`Form > Render input component [${ name }] [${ this.props.value }]`);
    return (
      <div className={ this.state.className }>
        <label>{ label }</label>
        <input
          type        = { type }
          className   = "form-control"
          name        = { name }
          placeholder = { placeholder }
          value       = { this.props.value }
          onChange    = { this.props.onChange }
          onFocus     = { this.focus }
          onBlur      = { this.blur }
          tabIndex    = { tabIndex }
          required    = { required ? true : false }
        />
        <div className="focus-bar"></div>
        <span className="help-text">{ helpText }</span>
      </div>
    );
  }

}
