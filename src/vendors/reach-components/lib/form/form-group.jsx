'use strict';

import React from 'react';
import Reach from 'reach-react';

let DOM = Reach.DOM;

export default class FormGroup extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur  = this.onBlur.bind(this);
    this.state   = {
      focus     : false,
      formGroup : 'form-group'
    }
  }

  /**
   * @method componentDidUpdate
   * @param  {Object} prevProps
   * @param  {Object} prevState
   */
  componentDidUpdate(prevProps, prevState) {
    let formGroup = this.getClass();
    if (this.state.formGroup !== formGroup) {
      this.setState({
        formGroup : formGroup
      });
    }
  }

  /**
   * @method onFocus
   */
  onFocus() {
    this.setState({
      focus     : true,
      formGroup : this.getClass(true)
    });
  }

  /**
   * @method onBlur
   */
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
   * @method getField
   * @param  {Object} field
   * @return {Component}
   */
  getField(field) {
    switch (field.component) {
      case 'input'  : return this.getInput(field);
      case 'select' : return this.getSelect(field);
    }
    return null;
  }

  /**
   * @method getInput
   * @param  {Object} field
   */
  getInput(field) {
    let { autoComplete, label, name, type, helpText, required } = field;
    return (
      <div className={ this.state.formGroup }>
        <label>{ label }</label>
        <input
          name         = { name }
          className    = "form-control"
          onChange     = { this.props.onChange }
          required     = { required }
          type         = { type }
          tabIndex     = { this.props.tabIndex }
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
    );
  }

  /**
   * @method getSelect
   * @param  {Object} field
   */
  getSelect(field) {
    let { autoComplete, label, name, type, helpText, options, required } = field;
    return (
      <div className="form-group active">
        <label>{ label }</label>
        <select name={ name } value={ this.props.value } onChange={ this.props.onChange } tabIndex={ this.props.tabIndex }>
        {
          options.map((option, i) => {
            return <option key={ i } value={ option.value }>{ option.name }</option>
          })
        }
        </select>
      </div>
    );
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className="col-md-12">
      {
        this.getField(this.props.field)
      }
      </div>
    );
  }

}
