'use strict';

import React   from 'react';
import Reach   from 'reach-react';
import Sidebar from './sidebar';
import Header  from './header';

// ### App Styles

import './styles/style.scss';

export default class AppLayout extends React.Component {
  render() {
    return (
      <div id="app">
        <Header />
        <Sidebar />
        <div id="content">
          { this.props.children }
        </div>
        <div id="events">
          Hello World
        </div>
      </div>
    );
  }
}