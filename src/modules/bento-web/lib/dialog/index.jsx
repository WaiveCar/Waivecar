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


  render() {
    let { title, onClick, content } = this.props;

    let closeModal = () => this.setState({ open: false })
 
    let open = () => {
      this.setState({open: true})
    }

    let saveAndClose = () => {
      api.saveData()
        .then(() => this.setState({ open: false }))
    }
    return (
      <div>
        <button onClick={ open } type='button'>Launch modal</button>
        <Modal
          show={this.state.open}
          onHide={closeModal}
          aria-labelledby="ModalHeader"
        >
          <Modal.Header closeButton>
            <Modal.Title id='ModalHeader'>{ title }</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{ content }</p>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Dismiss className='btn btn-default'>Cancel</Modal.Dismiss>
 
            <button className='btn btn-primary' onClick={saveAndClose}>
              Save
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

}
