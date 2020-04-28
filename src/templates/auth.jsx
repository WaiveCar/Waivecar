import React         from 'react';
import { auth, api } from 'bento';
import { templates } from 'bento-ui';
import policies      from 'policies';

// ### Identifier Authentication Template

class AuthTemplate extends React.Component {
  render() {
    return (
      <div id="auth">
        <img className="bg" src="/images/auth/login.jpg" />
        <div className="video">
        <video autoPlay className="bg-vid" loop poster="/images/auth/login.jpg">
          <source src="/images/auth/login.webm" type="video/webm" />
          <source src="/images/auth/login.mp4" type="video/mp4" />
        </video>
        <div className="vid-overlay"></div>
        </div>
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
      onEnter   : policies.isAnonymous
    },
    {
      path      : '/reset-password',
      component : require('views/auth/reset-password'),
      onEnter   : policies.isAnonymous
    },
      /*
    {
      path      : '/register',
      component : require('views/auth/register'),
      onEnter   : policies.isAnonymous
    },
    */
    {
      path      : '/logout',
      component : require('views/auth/logout'),
      onEnter   : policies.isAuthenticated
    },
    {
      path: '/work-redirect',
      component: require('views/site/work-redirect'),
    },
    {
      path: '/custom/:organizationName',
      component: require('views/auth/organization-signin'),
    },
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

    // ### Facebook

    /*
    {
      path      : '/auth/facebook/register',
      component : require('views/auth/facebook/register'),
      onEnter   : (nextState, replaceState) => {
        policies.isAnonymous(nextState, replaceState);
      }
    },
    */
    {
      path      : '/auth/facebook/connect',
      component : require('views/auth/facebook/connect'),
      onEnter   : (nextState, replaceState) => {
        policies.isAuthenticated(nextState, replaceState);
      }
    },
    {
      path      : '/auth/facebook/login',
      component : require('views/auth/facebook/login'),
      onEnter   : (nextState, replaceState) => {
        policies.isAnonymous(nextState, replaceState);
      }
    }

  ]
});
