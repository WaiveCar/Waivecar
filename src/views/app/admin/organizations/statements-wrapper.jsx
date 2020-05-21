import React, {Component} from 'react';
import Statements from './statements';
import {api, auth} from 'bento';

class StatementsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organization: null,
    };
  }

  render() {
    let {organization} = this.state;
    return organization ? (
      <Statements organization={organization} />
    ) : (
      <div>Loading</div>
    );
  }
}

export default StatementsWrapper;
