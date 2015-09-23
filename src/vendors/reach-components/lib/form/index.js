'use strict';

import React     from 'react';
import { api }   from 'reach-react';
import Button    from '../button';
import FormGroup from './form-group';
import Snackbar  from '../snackbar';
import './style.scss';

export default class Form extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      data : this.props.data || {}
    };
    this.inputChange = this.inputChange.bind(this);
    this.submit      = this.submit.bind(this);
  }

  /**
   * @method componentWillReceiveProps
   */
  componentWillReceiveProps(nextProps, nextState) {
    let prevData = this.state.data;
    let nextData = nextProps.data;
    if (prevData.id !== nextData.id) {
      this.setState({
        data : nextData
      });
    }
  }

  /**
   * Handle the change event for form inputs.
   * @method inputChange
   * @param  {Object} event
   */
  inputChange(event) {
    let input = this.state.data;
    console.log(this.state.data);
    input[event.target.name] = event.target.value;
    this.setState({
      data : input
    });
  }

  /**
   * Flush the form by emptying the entire form.
   * @method flush 
   */
  flush() {
    let focusedInputs = document.getElementsByClassName('focus');
    if (focusedInputs.length) {
      for (let i = 0, len = focusedInputs.length; i < len; i++) {
        focusedInputs[i].children[1].blur();
      }
    }
    this.setState({
      data : {}
    });
  }

  /**
   * @method submit
   */
  submit(event) {
    event.preventDefault();
    api[this.props.method.toLowerCase()](this.props.action, this.state.data, function (err, res) {
      if (err) {
        if (this.props.onError) {
          this.props.onError(err, this.flush.bind(this));
        } else {
          Snackbar.notify({
            type    : 'danger',
            message : err.message
          });
        }
        return;
      }
      if (this.props.onSuccess) {
        this.props.onSuccess(res, this.flush.bind(this));
      } else {
        Snackbar.notify({
          message : 'Success'
        });
      }
    }.bind(this));
  }

  /**
   * @method render
   */
  render() {
    return (
      <form className={ this.props.className || 'r-form' } onSubmit={ this.submit }>
        <div className="row">
        {
          this.props.fields.map((field, i) => {
            return (
              <FormGroup 
                key      = { i }
                tabIndex = { i + 1 } 
                field    = { field } 
                value    = { this.state.data ? this.state.data[field.name] : '' } 
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