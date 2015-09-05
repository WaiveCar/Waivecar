'use strict';

import React      from 'react';
import Reach      from 'reach-react';
import Button     from '../button';
import FormGroup  from './form-group';
import './style.scss';

export default class Form extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.inputChange = this.inputChange.bind(this);
    this.submit      = this.submit.bind(this);
    this.state       = {
      record : null
    };
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    this.setState({
      record : this.props.record || {}
    });
  }

  /**
   * Handle the change event for form inputs.
   * @method inputChange
   * @param  {Object} event
   */
  inputChange(event) {
    let input = this.state.record;
    input[event.target.name] = event.target.value;
    this.setState({
      record : input
    });
  }

  /**
   * @method submit
   */
  submit(event) {
    event.preventDefault();
    Reach.API[this.props.method.toLowerCase()](this.props.action, this.state.record, function (err, res) {
      if (err) {
        if (this.props.onError) {
          this.props.onError(err);
        } else {
          alert('Error');
          console.log(err);
        }
        return;
      }
      if (this.props.onSuccess) {
        this.props.onSuccess(res);
      } else {
        alert('Success');
        console.log(res);
      }
      // TODO
      // Add global notification response when onSuccess or onError is not defined
    }.bind(this));
  }

  /**
   * @method render
   */
  render() {
    return (
      <form className={ this.props.className || 'reach-form' } onSubmit={ this.submit }>
        <div className="row">
        {
          this.props.fields.map((field, i) => {
            return (
              <FormGroup 
                key      = { i } 
                field    = { field } 
                value    = { this.state.record ? this.state.record[field.name] : '' } 
                onChange = { this.inputChange } 
              />
            )
          }.bind(this))
        }
        </div>
        <div className="form-actions">
          <div className="btn-group" role="group">
          {
            this.props.buttons.map((btn, i) => {
              return (
                <Button 
                  key       = { i } 
                  className = { btn.class } 
                  type      = { btn.type || 'button' } 
                  value     = { btn.value } 
                  style     = { btn.style || null } 
                  onClick   = { btn.click }
                />
              );
            })
          }
          </div>
        </div>
      </form>
    );
  }

}