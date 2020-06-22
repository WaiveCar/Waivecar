import React, {Component} from 'react';
import Hubs from './hubs';
import {auth} from 'bento';

class HubsWrapper extends Component {
  constructor(props) {
    super(props);
    this._user = auth.user();
    let {id} = this.props.params;
    this.id = id;
    this.org = this._user.organizations.find(org => org.organizationId === Number(this.id))
  }

  componentDidMount() {
    let {id} = this.props.params;
    if (!this._user.canSee('organization', {id})) {
      return this.props.history.replaceState({}, '/forbidden');
    }
  }

  render() {
    return (
      <div className="box">
        <Hubs orgId={this.id} />
      </div>)
  }
}

export default HubsWrapper;
