'use strict';

import React     from 'react';
import Reach     from 'reach-react';
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
   * Flush the form by emptying the entire form.
   * @method flush 
   */
  flush() {
    document.getElementsByClassName('focus')[0].children[1].blur();
    this.setState({
      record : {}
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