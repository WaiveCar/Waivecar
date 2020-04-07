import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

class Organization extends Component {
  constructor(props) {
    super(props);
    let pathName = window.location.pathname.split('/');
    this.state = {
      id: pathName.pop(),
    };
  }

  render() {
    return <div>Orgs Show</div>;
  }
}

module.exports = Organization;
