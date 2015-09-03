'use strict';

import React        from 'react';
import Reach        from 'reach-react';
import HeaderAvatar from './header-avatar';
import HeaderMeta   from './header-meta';

export default class ProfileHeader extends React.Component {
  
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <header>
        <div className="header-overlay"></div>
        <div className="container">
          <HeaderAvatar />
          <HeaderMeta />
        </div>
      </header>
    );
  }

}