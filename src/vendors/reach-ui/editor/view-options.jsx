import React, { PropTypes, Component } from 'react';
import Modal                           from 'react-modal';

// const customStyles = {
//   overlay : {
//     position          : 'fixed',
//     top               : 0,
//     left              : 0,
//     right             : 0,
//     bottom            : 0,
//     backgroundColor   : 'rgba(0, 0, 0, .75)',
//     zIndex            : 99999
//   },
//   content : {
//     top                   : '50%',
//     left                  : '50%',
//     right                 : 'auto',
//     bottom                : 'auto',
//     marginRight           : '-50%',
//     transform             : 'translate(-50%, -50%)',
//     zIndex            : 99999
//   }
// };

export default class ViewOptions extends Component {

  constructor(...args) {
    super(...args);
    // this.open = this.open.bind(this);
    // this.close = this.close.bind(this);
    // this.save = this.open.bind(this);
    this.state = {
      options : JSON.stringify(this.props.options),
      show    : false
    }
  }

  static propTypes = {
    componentName : PropTypes.string.isRequired,
    options       : PropTypes.object.isRequired,
    update        : PropTypes.func.isRequired
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

  update(event) {
    console.log(event.target.value);
    this.setState({ options : event.target.value });
  }

  save() {
    let options = JSON.parse(this.state.options);
    this.props.update(options);
    this.close();
  }

  renderModal() {
    const { componentName, options } = this.props;
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
            <p>{ JSON.stringify(options) }</p>
            <form>
              <input type="text" value={ this.state.options } onChange={ this.update.bind(this) } />
            </form>
          </div>
          <div className="modal-footer">
            <div className="btn-group modal-actions">
              <button className="btn btn-danger-outline" onClick={ this.close.bind(this) }>Cancel</button>
              <button className="btn btn-primary-outline" onClick={ this.save.bind(this) }>Apply</button>
            </div>
          </div>
        </div>
      </Modal>
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
