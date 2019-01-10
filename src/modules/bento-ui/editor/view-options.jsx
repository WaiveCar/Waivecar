import React, { PropTypes } from 'react';
import { Form }             from 'bento-web';
import components           from '../lib/components';
import ItemCategories       from './item-categories';

class ViewOptions extends React.Component {

  constructor(...args) {
    super(...args);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.save = this.open.bind(this);
    this.state = {
      show   : false,
      fields : this.getFields()
    }
  }

  getFields() {
    switch (this.props.componentCategory) {
      case ItemCategories.ROW    : return [
      ];
      case ItemCategories.COLUMN : return [
        {
          name      : 'width',
          label     : 'Width (1-12)',
          component : 'input',
          type      : 'number'
        }
      ];
      default :
        return components.getOptions(this.props.componentType);
    }
  }

  static propTypes = {
    componentName     : PropTypes.string.isRequired,
    componentType     : PropTypes.string.isRequired,
    componentCategory : PropTypes.string.isRequired,
    options           : PropTypes.object.isRequired,
    update            : PropTypes.func.isRequired
  };

  open() {
    this.setState({
      show : true
    });
  }

  close() {
    this.setState({
      show : false
    });
  }

  submit(options) {
    this.props.update(options);
  }

  renderOptions() {
    const { componentName } = this.props;
    return (
      <div className="options-container">
        <div className="options-header">
          <h5>{ componentName } Options</h5>
        </div>
        <div className="options-content">
          { this.renderForm() }
        </div>
      </div>
    );
  }

  renderForm() {
    const { fields, options } = this.props;
    console.dir(options);
    console.dir(this.state.fields);

    return (
      <Form
        className = "bento-form"
        fields    = { this.state.fields }
        default   = { options }
        submit    = { this.submit.bind(this) }
        buttons   = {[
          {
            type  : 'button',
            value : 'Reset',
            class : 'btn btn-info',
            click : 'reset'
          },
          {
            type  : 'submit',
            value : 'Submit',
            class : 'btn btn-success',
            click : 'submit'
          }
        ]}
      />
    );
  }

  render() {
    return (
      <div className="view-options">
        <div className="view-options-menu">
          <button type="button" className="btn btn-icon" onClick={ this.open.bind(this) }>
            <i className="material-icons" role="edit">more_vert</i>
          </button>
        </div>
        { this.state.show && this.renderOptions() }
      </div>
    );
  }
}

module.exports = ViewOptions;