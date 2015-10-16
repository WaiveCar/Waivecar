'use strict';

import React                             from 'react';
import { auth }                          from 'reach-react';
import { Content }                       from 'reach-components';
import { components, fields, resources } from 'reach-ui';
import { Link }                          from 'react-router';

class UIRegistrationSection extends React.Component {

  renderRegistration() {
    return (
      <div className="text-center">
        <h1>Create an account</h1>
        <p>Once you're registered, you'll be able to find, book, and start using electric cars for free.</p>
        <Link className="btn btn-primary btn-lg" to="/register">Register</Link>
      </div>
    );
  }

  renderLogin() {
    return (
      <div className="text-center">
        <p>Welcome back <strong>{ auth.user.firstName }</strong></p>
        <Link className="btn btn-primary btn-lg" to="/dashboard">My Dashboard</Link>
      </div>
    );
  }

  render() {
    if (auth.check()) {
      return this.renderLogin();
    }

    return this.renderRegistration();
  }
}

// ### Register Component
export default {
  build : function() {
    return {
      name    : 'Registration Section',
      type    : 'meta-registration',
      class   : UIRegistrationSection,
      icon    : 'email',
      options : [
        {
          label     : 'Background Image',
          component : 'file',
          name      : 'fileId',
          helpText  : 'Set a background image',
          required  : false
        }
      ]
    };
  }
}