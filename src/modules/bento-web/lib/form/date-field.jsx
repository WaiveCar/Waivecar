import React                                from 'react';
import { dom, helpers, logger, api, relay } from 'bento';
import { resources }                        from 'bento-ui';
import moment                               from 'moment';
import DatePicker                           from 'react-toolbox/lib/date_picker';

let { type } = helpers;

module.exports = class DateField extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.hasFocus = false;
    this.state    = {
      className : null
    };
    this.onChange = this.onChange.bind(this);
    // this.focus = this.focus.bind(this);
    // this.blur  = this.blur.bind(this);
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

  // /**
  //  * @method focus
  //  */
  // focus() {
  //   this.hasFocus = true;
  //   this.setState({
  //     className : this.className(this.props.value)
  //   });
  // }

  // /**
  //  * @method blur
  //  */
  // blur() {
  //   this.hasFocus = false;
  //   this.setState({
  //     className : this.className(this.props.value)
  //   });
  // }

  /**
   * Sends input to the form state handler.
   * @method onChange
   * @param  {String} value
   * @param  {Object} options
   */
  onChange(value, options) {
    let bd = moment(value, "MM-DD-YYYY").format();
    console.log(bd);
    this.props.onChange({
      target : {
        type  : 'date',
        name  : bd,
        value : value
      }
    });
  }

  /**
   * @method render
   * @return {Component}
   */
  render() {
    let { label, name, type, placeholder, helpText, tabIndex } = this.props.options;
    let { value, disabled } = this.props;
    let dateValue = value;
    if (value) {
      value = moment(value).format('YYYY-MM-DD')
    }

    logger.debug(`Form > Render Date component [${ name }] [${ dateValue }]`);

    if (disabled) {
      return (
        <div className={ this.state.className }>
          <input type="text" disabled={ true } readOnly={ true } className="form-control" value={ value } />
          <div className="focus-bar"></div>
          <span className="help-text">{ helpText }</span>
      </div>
      );
    }

    return (
      <div className={ this.state.className }>
        <label>{ label }</label>
        <input
          type        = "date"
          className   = "form-control"
          name        = { name }
          placeholder = "MM/DD/YYYY"
          value       = { value }
          onChange    = { this.props.onChange }
          onFocus     = { this.focus }
          onBlur      = { this.blur }
          tabIndex    = { tabIndex }
        />
        <div className="focus-bar"></div>
        <span className="help-text">{ helpText }</span>
      </div>
    );
  }

}
