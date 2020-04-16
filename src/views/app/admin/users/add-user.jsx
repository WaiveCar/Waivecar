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
        <h3>Add a User</h3>
        <div className="box-content">
          <Form
            ref="personal"
            className="bento-form-static"
            fields={require('./user-form')}
            buttons={buttons}
            submit={() => this.submitUser()}
          />
          {this.currentUser.organizations.length ? (
            <div>Has Organizations</div>
          ) : (
            <div>No Organizations</div>
          )}
        </div>
      </div>
    );
  }
}

export default AddUser;
