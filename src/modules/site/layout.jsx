import React  from 'react';
import config from 'config';
import './style.scss';

export default class AppLayout {

  render() {
    return (
      <div id="site">
        { this.props.children }
      </div>
    );
  }

}