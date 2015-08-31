import React  from 'react';
import config from 'config';
import './style.scss';

export default class AuthLayout {
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