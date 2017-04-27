import React                                from 'react';
import { dom, helpers, logger, api, relay } from 'bento';
import { resources }                        from 'bento-ui';
import moment                               from 'moment';
import DatePicker                           from 'react-toolbox/lib/date_picker';

let { type } = helpers;

const ExternalDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSS';
const InternalDateFormat = 'MM/DD/YYYY';

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
    this.onBlur  = this.onBlur.bind(this);
  }



  tryConvertDate(value) {
    var date = moment(value, ExternalDateFormat, true);

    if (!date.isValid()) {
      date = moment(value, 'YYYY-MM-DD', true)
    }

    if (date.isValid()) {
      value = date.format(InternalDateFormat);
    }
    return value;
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    this.setState({
      className : this.className()
    });

    let value = this.props.value;

    if (value) {

      this.inputRef.value = this.tryConvertDate(value);
    }

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

    /*if (this.state.value !== nextState.value) {
      return true;
    }*/

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

  onChange(event) {
    let value = event.target.value;
    let resetState = false;

    if (value.length == 2 && value[1] != '/') {
      value += '/';
      resetState = true;
    }

    let date = null;

    if (value.length > 2) {
      var parts = value.split('/');
      if (parts.length == 2) {
        var days = parts[1];
        if (days.length == 2 && days[1] != '/') {
          value += '/';
          resetState = true;
        }
      }
      if (parts.length == 3 && parts[1].length == 4) {
        date = moment(value, InternalDateFormat);
      }
    }

    if (resetState) {
      this.inputRef.value = value;
    }


 /*   if (this.props.onChange && date) {

      this.props.onChange({
        target: {
          type: 'date',
          name: event.target.name,
          value: date.format('YYYY-MM-DD')
        }
      });
    }*/
  }

  onBlur(event) {
    let value = event.target.value;

    let date = moment(value, InternalDateFormat, true);

    if (this.props.onChange ) {
      this.props.onChange({
        target: {
          type: 'date',
          name: event.target.name,
          value:  date.isValid() ? date.format(ExternalDateFormat) : value
        }
      });
    }
  }

  /**
   * @method render
   * @return {Component}
   */
  render() {
    let { label, name, helpText, tabIndex } = this.props.options;
    let { value, disabled } = this.props;

    if (value) {
      value = this.tryConvertDate(value);
    }

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
          type        = "text"
          className   = "form-control"
          name        = { name }
          placeholder = "MM/DD/YYYY"
          onChange    = { this.onChange }
          ref         = { (input) => { this.inputRef = input; } }
          onBlur     = { this.onBlur}
          tabIndex    = { tabIndex }
        />
        <div className="focus-bar"></div>
        <span className="help-text">{ helpText }</span>
      </div>
    );
  }

}
