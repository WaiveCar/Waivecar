'use strict';

import React     from 'react';
import Reach     from 'reach-react';
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
    this.state = {
      record : null
    };
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    this.setState({
      record : this.props.record
    });
  }

  /**
   * Handle the change event for form inputs.
   * @method _handleChange
   * @param  {Object} event
   */
  _handleChange(event) {
    let input = this.state.record;
    input[event.target.name] = event.target.value;
    this.setState({
      record : input
    });
  }

  /**
   * @method _handleSubmit
   */
  _handleSubmit(event) {
    event.preventDefault();
    Reach.API[this.props.method.toLowerCase()](this.props.action, this.state.record, function (err, record) {
      if (err) {
        return console.log(err);
      }
      alert('Update Success!');
    });
  }

  /**
   * @method render
   */
  render() {
    return (
      <form className="form-component" onSubmit={ this._handleSubmit }>
        {
          this.props.fields.map(function (field, i) {
            if (field.readOnly && field.hideEmpty) {
              return;
            }
            return <FormGroup key={ i } field={ field } value={ this.state.record ? this.state.record[field.name] : '' } onChange={ this._handleChange } />
          }.bind(this))
        }
        <Button className="btn btn-primary" type="submit" value="Submit" />
      </form>
    );
  }

}