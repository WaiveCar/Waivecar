'use strict';

import React from 'react';

export default class FormGroup extends React.Component {

  /**
   * @method render
   */
  render() {
    let { tabIndex, autoComplete, label, type, name, helpText, required } = this.props.field;
    console.log('asd');
    return (
      <div className="form-group">
        <input
          name         = { name }
          className    = "form-control"
          onChange     = { this.props.onChange }
          required     = { required }
          type         = { type }
          tabIndex     = { tabIndex }
          autoComplete = { autoComplete }
          value        = { this.props.value }
        />
        <span className="highlight"></span>
        <span className="bar"></span>
        <label className="label">{ label }</label>
        <span className="help-text">{ helpText }</span>
      </div>
    );
  }

}
