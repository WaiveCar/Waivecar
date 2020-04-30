import React, {Component} from 'react';
import {api} from 'bento';
import {Form, snackbar} from 'bento-web';

let buttons = [
  {
    value: 'Create Statement',
    type: 'submit',
    class: 'btn btn-primary btn-profile-submit',
  },
];

class CreateStatement extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  createStatement() {

  }

  render() {
    const {name} = this.props.location.query;
    return (
      <div className="box">
        <h3 style={{marginBottom: '1rem'}}>New Statement for {name}</h3>
        <div className="box-content">
          <Form
            ref="addUser"
            className="bento-form-static"
            fields={require('./statement-form')}
            buttons={buttons}
            submit={e => this.createStatement()}
          />
        </div>
      </div>
    );
  }
}

export default CreateStatement;
