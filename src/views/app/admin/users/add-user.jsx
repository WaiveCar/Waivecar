import React, {Component} from 'react';
import {api, auth} from 'bento';
import {Form, snackbar} from 'bento-web';

let buttons = [
  {
    value: 'Add User',
    type: 'submit',
    class: 'btn btn-sm btn-profile-submit',
  },
];

class AddUser extends Component {
  constructor(props) {
    super(props);
    this.currentUser = auth.user();
  }

  submitUser() {
    console.log('submit');
  }

  render() {
    return (
      <div className="box">
        <h3>Add Users</h3>
        <div className="box-content">
          User Adding Component
          <Form
            ref="personal"
            className="bento-form-static"
            fields={require('./user-form')}
            buttons={buttons}
            submit={() => this.submitUser()}
          />
        </div>
      </div>
    );
  }
}

export default AddUser;
