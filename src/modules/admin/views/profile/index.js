'use strict';

import React from 'react';
import Reach from 'reach-react';
import Form  from 'components/form';

export default class ProfileView extends React.Component {

  componentWillMount() {
    this.setState({
      form : {
        uri    : '/users',
        method : 'PUT',
        model  : Reach.Auth.user,
        fields : [
          {
            component   : 'input',
            type        : 'text',
            name        : 'firstName',
            displayName : 'First Name',
            helpText    : 'Enter your firstname',
            required    : true
          },
          {
            component   : 'input',
            type        : 'text',
            name        : 'lastName',
            displayName : 'Last Name',
            helpText    : 'Enter your lastname',
            required    : true
          },
          {
            component   : 'input',
            type        : 'text',
            name        : 'email',
            displayName : 'Email Address',
            helpText    : 'Enter your email',
            required    : true
          },
          {
            component   : 'input',
            type        : 'text',
            name        : 'facebook',
            displayName : 'Facebook',
            readOnly    : true,
            hideEmpty   : true
          }
        ]
      }
    });
  }

  render() {
    return (
      <div className="container">
        <div className="header">
          <h2>Profile</h2>
        </div>
        <section className="card">
          <div className="card-body">
            <Form form={ this.state.form } />
          </div>
        </section>
      </div>
    );
  }
}