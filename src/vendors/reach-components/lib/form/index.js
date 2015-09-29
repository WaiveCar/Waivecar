'use strict';

import React            from 'react';
import { type, object } from 'reach-react/lib/helpers';
import { app }          from 'config';
import FormGroup        from './form-group';
import Button           from '../button';
import './style.scss';

export default class Form extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      data : {}
    };
    this.input  = this.input.bind(this);
    this.reset  = this.reset.bind(this);
    this.submit = this.submit.bind(this);
  }

  /**
   * Returns the current data state of the form.
   * @method data
   * @return {Object}
   */
  data() {
    return {
      ...this.props.default,
      ...this.state.data
    }
  }

  /**
   * Input event updating the data state of the form.
   * @method input
   * @param  {Object} event
   */
  input(event) {
    let target = event.target;
    let data   = this.state.data;
    switch (target.type) {
      case 'checkbox' :
        data[target.name] = target.checked;
        break;
      default :
        data[target.name] = target.value;
        break;
    }
    this.setState({
      data : data
    });
  }

  /**
   * @method buttons
   * @param  {Array} list
   * @return {Component}
   */
  buttons(list) {
    if (list) {
      return list.map((btn, i) => {
        return (
          <Button 
            key       = { i } 
            className = { btn.class } 
            type      = { btn.type || 'button' } 
            value     = { btn.value } 
            style     = { btn.style || null } 
            onClick   = { 
              type.isFunction(btn.click) ? btn.click : this[btn.click]
            }
          />
        );
      });
    }
  }

  /**
   * Cancels the current editing process and reverts to default values.
   * @method reset
   */
  reset() {
    this.setState({
      data : this.props.default ? object.clone(this.props.default) : {}
    });
  }

  /**
   * Executes a submit action on the form, if a submit method has been 
   * defined we ignore the submit event and pass it to the defined submit.
   * @method submit
   * @param  {Object} event
   */
  submit(event) {
    if (type.isFunction(this.props.submit)) {
      event.preventDefault();
      this.props.submit(this.data(), this.reset);
    }
  }

  /**
   * @method render
   */
  render() {
    return (
      <form className={ this.props.className } role={ this.props.role || 'form' } action={ this.props.action } method={ this.props.method } onSubmit={ this.submit }>
        {
          this.props.fields.map((field, index) => {
            return (
              <FormGroup 
                key   = { index }
                field = { field }
                data  = { this.data() }
                input = { this.input }
              />
            )
          }.bind(this))
        }
        <div className="form-actions">
          <div className="btn-group" role="group">
            {
              this.buttons(this.props.buttons)
            }
          </div>
        </div>
        {
          this.toJSON()
        }
      </form>
    );
  }

  /**
   * Setting the application log level to silly will render a pre tag with
   * the forms current data state in the bottom of the form.
   * @method toJSON
   * @return {Component}
   */
  toJSON() {
    if (app.log.silly) {
      return (
        <pre style={{ borderTop : '1px dashed #e3e3e3', marginTop : 30, paddingTop : 30 }}>
          {
            JSON.stringify(this.data(), null, 2)
          }
        </pre>
      );
    }
  }

}