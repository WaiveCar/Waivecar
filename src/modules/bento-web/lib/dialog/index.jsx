import React from 'react';
var Modal = require('react-bootstrap-modal')

module.exports = class Dialog extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      open: false
    };
  }
 
  componentDidMount() {
    this.setState({open: false})
  }

  something() {
    console.log('something');
  }

  render() {
    let closeModal = () => this.setState({ open: false })
 
    let open = () => {
      this.setState({open: true})
    }

    let onSuccess = () => {
      this.setState({ open: false });
      if (this.props.onSuccess) {
        this.props.onSuccess();
      }
    }

    return (
      <div>
        <button onClick={ open } type='button'>Launch modal</button>
        <Modal
          show={ this.state.open }
          onHide={ closeModal }
          aria-labelledby="ModalHeader"
        >
          <Modal.Header closeButton>
            <Modal.Title id='ModalHeader'>{ this.props.title }</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{ this.props.content }</p>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Dismiss className='btn btn-default'>Cancel</Modal.Dismiss>
 
            <button className='btn btn-primary' onClick={ onSuccess }>
              OK
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

}
