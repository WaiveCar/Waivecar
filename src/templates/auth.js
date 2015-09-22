'use strict';

import React         from 'react';
import { templates } from 'reach-ui';
import policies      from 'policies';
import 'styles/auth.scss';

/**
 * Renders the authentication layout for the application.
 * @class AuthTemplate
 */
class AuthTemplate extends React.Component {
  render() {
    return (
      <div id="auth">
        <video autoPlay className="bg-vid" loop poster="/images/auth/login.jpg">
          <source src="/images/auth/login.webm" type="video/webm" />
          <source src="/images/auth/login.mp4" type="video/mp4" />
        </video>
        <div className="vid-overlay"></div>
        { this.props.children }
      </div>
    );
  }
}

// ### Register Template

templates.register('auth', {
  component   : AuthTemplate,
  childRoutes : [
    {
      path      : '/login',
      component : require('views/auth/login'),
      onEnter   : (nextState, transition) => {
        policies.isAnonymous(nextState, transition);
      }
    },
    {
      path    : '/logout',
      onEnter : (nextState, transition) => {
        Reach.Auth.logout();
        transition.to('/', null);
      }
    }
  ]
});