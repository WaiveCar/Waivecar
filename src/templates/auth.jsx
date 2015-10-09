'use strict';

import React         from 'react';
import { auth, api } from 'reach-react';
import { templates } from 'reach-ui';
import policies      from 'policies';
import 'styles/auth/style.scss';

// ### Identifier Authentication Template

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

templates.register('auth', {
  component   : AuthTemplate,
  childRoutes : [
    {
      path      : '/login',
      component : require('views/auth/login'),
      onEnter   : (nextState, replaceState) => {
        policies.isAnonymous(nextState, replaceState);
      }
    },
    {
      path      : '/reset-password',
      component : require('views/auth/reset-password'),
      onEnter   : (nextState, replaceState) => {
        policies.isAnonymous(nextState, replaceState);
      }
    },
    {
      path      : '/register',
      component : require('views/auth/register'),
      onEnter   : (nextState, replaceState) => {
        policies.isAnonymous(nextState, replaceState);
      }
    },
    {
      path    : '/logout',
      onEnter : (nextState, replaceState) => {
        auth.logout();
        replaceState(null, '/');
      }
    }
  ]
});

// ### Social Authentication Template

class SocialAuthTemplate extends React.Component {
  render() {
    return (
      <div id="social-auth">
        { this.props.children }
      </div>
    );
  }
}

templates.register('social-auth', {
  component   : SocialAuthTemplate,
  childRoutes : [
    {
      path      : '/auth/facebook',
      component : require('views/auth/social'),
      onEnter   : (nextState, replaceState) => {
        policies.isAnonymous(nextState, replaceState);
      }
    }
  ]
});