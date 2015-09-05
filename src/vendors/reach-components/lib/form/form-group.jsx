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
      formGroup : 'form-group'
    }
  }

  componentDidMount() {
    this.setState({
      formGroup : this.getClass()
    });
  }

  onFocus() {
    this.setState({
      formGroup : this.getClass(true)
    });
  }

  onBlur() {
    this.setState({
      formGroup : this.getClass()
    });
  }

  /**
   * Returns current state for the form group.
   * @method getClass
   * @param  {Boolean} [focus] Default: false
   * @return {String}
   */
  getClass(focus = false) {
    let result = {};
    result['form-group'] = true;
    result.focus         = focus;
    result.valid         = this.refs.input && this.refs.input.value ? true : false;
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
          <span className="help-text">{ helpText }</span>
        </div>
      </div>
    );
  }

}
