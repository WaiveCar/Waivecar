'use strict';

import React from 'react';
import Reach from 'reach-react';

let DOM = Reach.DOM;

export default class FormGroup extends React.Component {

  constructor(...args) {
    super(...args);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur  = this.onBlur.bind(this);
    this.state   = {
      focus     : false,
      formGroup : 'form-group'
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let formGroup = this.getClass();
    if (this.state.formGroup !== formGroup) {
      this.setState({
        formGroup : formGroup
      });
    }
  }

  onFocus() {
    this.setState({
      focus     : true,
      formGroup : this.getClass(true)
    });
  }

  onBlur() {
    this.setState({
      focus     : false,
      formGroup : this.getClass()
    });
  }

  /**
   * Returns current state for the form group.
   * @method getClass
   * @return {String}
   */
  getClass() {
    let result = {};
    result['form-group'] = true;
    result.active        = (this.refs.input && this.refs.input.value) || this.state.focus;
    result.focus         = this.state.focus;
    return DOM.setClass(result);
  }

  /**
   * @method render
   */
  render() {
    let { autoComplete, tabIndex, label, name, component, type, helpText, required } = this.props.field;
    return (
      <div className="col-md-12">
        <div className={ this.state.formGroup }>
          <label>{ label }</label>
          <input
            name         = { name }
            className    = "form-control"
            onChange     = { this.props.onChange }
            required     = { required }
            type         = { type }
            tabIndex     = { tabIndex }
            placeholder  = { this.props.placeholder || '' }
            autoComplete = { autoComplete }
            value        = { this.props.value }
            onFocus      = { this.onFocus }
            onBlur       = { this.onBlur }
            ref          = "input"
          />
          <div className="focus-bar"></div>
          <span className="help-text">{ helpText }</span>
        </div>
      </div>
    );
  }

}
