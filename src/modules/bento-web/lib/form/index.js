import React               from 'react';
import { helpers, logger } from 'bento';
import { app }             from 'config';
import FormGroup           from './form-group';
import Button              from '../button';

let { type, object } = helpers;

module.exports = class Form extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      data : {}
    };
    this.onChange = this.onChange.bind(this);
    this.reset    = this.reset.bind(this);
    this.submit   = this.submit.bind(this);
  }

  /**
   * @method componentWillReceiveProps
   */
  componentWillReceiveProps(nextProps, nextState) {
    if (Object.keys(nextState).length) {
      this.setState({
        data : nextProps.default
      });
    }
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
   * @method onChange
   * @param  {Object} event
   */
  onChange(event) {
    let target     = event.target;
    let data       = this.data();
    let { change } = this.props;

    // ### Update Target

    switch (target.type) {
      case 'number' :
        data[target.name] = +target.value;
        break;
      case 'multi-select' :
        if (target.reset) {
          data[target.name] = [];
          break;
        }
      case 'checkbox' :
        if (target.reset) {
          data[target.category] = [];
        } else if (target.category) {
          data[target.category] = checkbox(data[target.category], event.target);
        } else {
          data[target.name] = target.value;
        }
        break;
      default :
        data[target.name] = target.value;
        break;
    }

    // ### Update Data

    this.setState({
      data : data
    });

    // ### External Event Handler

    if (change) {
      change(target);
    }
  }

  /**
   * @method buttons
   * @param  {Array} list
   * @return {Component}
   */
  buttons(list) {
    if (list) {
      return (
        <div className="form-actions text-center">
          <div className="btn-group" role="group">
          {
            list.map((btn, i) => {
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
              )
            })
          }
          </div>
        </div>
      );
    } else if (this.props.submit) {
      return <button type="submit" style={{ display : 'none' }}>Submit</button>;
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
    let { submit } = this.props;
    if (type.isFunction(submit)) {
      event.preventDefault();
      submit(this.data(), this.reset);
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
                key      = { index }
                field    = { field }
                data     = { this.data() }
                onChange = { this.onChange }
                disabled = { this.props.disabled }
              />
            )
          }.bind(this))
        }
        {
          this.buttons(this.props.buttons)
        }
      </form>
    );
  }

}

// ### Input Cases

/**
 * @method checkbox
 * @param  {Array}  data
 * @param  {Object} target
 */
function checkbox(data, target) {
  let result = [];

  if (data) {
    data.forEach((value) => {
      if (value === target.name && !target.checked) {
        return;
      }
      result.push(value);
    });
  }

  if (target.checked) {
    result.push(target.name);
  }

  return result;
}
