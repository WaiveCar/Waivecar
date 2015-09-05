'use strict';

import React              from 'react';
import Reach              from 'reach-react';
import { Form, Snackbar } from 'reach-components';

let user   = Reach.Auth.user;
let fields = {
  role : {
    component : 'select',
    options   : [
      {
        name  : 'User',
        value : 'user'
      },
      {
        name  : 'Admin',
        value : 'admin'
      }
    ],
    label    : 'Role',
    helpText : 'Select a Role'
  },
  firstName : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'First Name',
    helpText  : null
  },
  lastName : {
    component : 'input',
    type      : 'text',
    required  : true,
    label     : 'Last Name',
    helpText  : null
  },
  email : {
    component : 'input',
    type      : 'email',
    required  : true,
    label     : 'Email Address',
    helpText  : null
  },
  password : {
    component : 'input',
    type      : 'password',
    required  : true,
    label     : 'Password',
    helpText  : 'choose a password longer than 6 characters'
  }
};

export default class ProfileView extends React.Component {

  fields() {
    let result = [];
    [ 'firstName', 'lastName', 'email' ].forEach(function (value) {
      if (fields[value]) {
        let field = fields[value];
        field.name = value;
        result.push(field);
      }
    });
    return result;
  }

  buttons() {
    return [
      {
        value : 'update',
        type  : 'submit',
        class : 'btn btn-primary'
      }
    ];
  }

  handleSuccess(user) {
    Snackbar.notify({
      type    : 'success',
      message : 'Your details was successfully updated.'
    });
  }

  handleError(error) {
    Snackbar.notify({
      type    : 'danger',
      message : error.message
    });
  }

  render() {
    return (
      <div id="profile">
        <div className="content-header">
          <h1><span>My Profile</span></h1>
        </div>
        <div className="container-form">
          <Form
            key       = { user.id }
            method    = "PUT"
            action    = { '/users/' + user.id }
            fields    = { this.fields() }
            record    = { user }
            onSuccess = { this.handleSuccess }
            onError   = { this.handleError }
            buttons   = { this.buttons() }
          />
        </div>
      </div>
    );
  }
}