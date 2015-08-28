'use strict';

import React     from 'react';
import Button    from 'components/button';
import FormGroup from './form-group';
import './style.scss';

export default class Form extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this._handleChange = this._handleChange.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  /**
   * @method componentWillMount
   */
  componentWillMount() {
    this.setState({
      model : this.props.form.model || {}
    });
  }

  /**
   * Handle the change event for form inputs.
   * @method _handleChange
   * @param  {Object} event
   */
  _handleChange(event) {
    let input = this.state.model;
    input[event.target.name] = event.target.value;
    this.setState({
      model : input
    });
  }

  /**
   * @method _handleSubmit
   */
  _handleSubmit(event) {
    event.preventDefault();
    console.log(this.state.model);
  }

  /**
   * @method render
   */
  render() {
    let self = this;
    return (
      <form className="reach-form" onSubmit={ this._handleSubmit }>
        {
          this.props.form.fields.map(function (field, i) {
            if (field.readOnly && field.hideEmpty) {
              return;
            }
            return <FormGroup key={ i } field={ field } value={ self.state.model[field.name] } onChange={ self._handleChange } />
          })
        }
        <Button type="submit" value="Submit" />
      </form>
    );
  }

}