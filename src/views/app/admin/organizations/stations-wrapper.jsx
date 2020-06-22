import React, {Component} from 'react';
import {auth} from 'bento';

class StationsWrapper extends Component {
  constructor(props) {
    super(props);
    this._user = auth.user();
  }

  componentDidMount() {
    let {id} = this.props.params;
    if (!this._user.canSee('organization', {id})) {
      return this.props.history.replaceState({}, '/forbidden');
    }
  }

  render() {
    return <div>Base Stations</div>;
  }
}

export default StationsWrapper;
