import React  from 'react';
import config from 'config';
import './style.scss';

export default class SiteLayout extends React.Component {

  render() {
    return (
      <div id="site">
        { this.props.children }
      </div>
    );
  }

}