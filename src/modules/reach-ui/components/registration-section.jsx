'use strict';

import React                             from 'react';
import { auth }                          from 'reach-react';
import { Content }                       from 'reach-components';
import { components, fields, resources } from 'reach-ui';
import { Link }                          from 'react-router';

class UIRegistrationSection extends React.Component {
    // if (auth.check()) {
    //   return false;
    // }
  render() {

    return (
      <div className="text-center">
        <h1>Create an account</h1>
        <p>Once you're registered, you'll be able to find, book, and start using electric cars for free.</p>
        <Link className="btn btn-primary btn-lg" to="/register">Register</Link>
      </div>
    );
  }
}

// ### Register Component
export default {
  build : function() {
    return {
      name    : 'Registration Section',
      type    : 'meta-registration',
      class   : UIRegistrationSection,
      icon    : 'email'
    };
  }
}