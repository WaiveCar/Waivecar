import React, {Component} from 'react';
import Hubs from './hubs';
import {auth} from 'bento';

class HubsWrapper extends Component {
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
    let {id} = this.props.params;
    return (
      <div className="box">
        <Hubs orgId={id} />
      </div>)
  }
}

export default HubsWrapper;
