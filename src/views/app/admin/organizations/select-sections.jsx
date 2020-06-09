import React, {Component} from 'react';
import {api, auth} from 'bento';

class SelectSections extends Component {
  constructor(props) {
    super(props);
    this._user = auth.user();
  }

  updateOrg() {}

  render() {
    return <div>Select</div>;
  }
}

export default SelectSections;
