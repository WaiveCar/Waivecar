import React, { PropTypes, Component } from 'react';
import { Form, Modal }                 from 'reach-components';
import components                      from '../lib/components';
import ItemCategories                  from './item-categories';

export default class ViewOptions extends Component {

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
    this.close();
  }

  renderModal() {
    const { componentName } = this.props;
    return (
      <Modal
        className      ="Modal__Bootstrap modal-dialog"
        isOpen         ={ this.state.show }
        onRequestClose ={ this.close.bind(this) }
      >
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="btn btn-icon close" onClick={ this.close.bind(this) }>
              <i className="material-icons" role="edit">close</i>
            </button>
            <h5>{ componentName } Options</h5>
          </div>
          <div className="modal-body">
            { this.renderForm() }
          </div>
        </div>
      </Modal>
    );
  }

  renderForm() {
    const { fields, options } = this.props;
    console.dir(options);
    console.dir(this.state.fields);

    return (
      <Form
        className = "r-form"
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
        { this.state.show && this.renderModal() }
      </div>
    );
  }
}
