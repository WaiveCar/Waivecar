'use strict';

import React from 'react';
import Reach from 'reach-react';
import md5   from 'md5';

let auth = Reach.Auth;

export default class HeaderAvatar extends React.Component {
  render() {
    return (
      <div className="header-avatar animated zoomIn">
        <div className="header-avatar-image" style={{ background : 'url(//www.gravatar.com/avatar/'+ md5(auth.user.email) +'?s=180) center center / cover' }}></div>
      </div>
    );
  }
}