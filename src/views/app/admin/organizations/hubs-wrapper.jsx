import React, {Component} from 'react';
import Hubs from './hubs';
import {auth, api} from 'bento';

class HubsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organization: null,
    }
    this._user = auth.user();
  }

  componentDidMount() {
    let {id} = this.props.params;
    if (!this._user.canSee('organization', {id})) {
      return this.props.history.replaceState({}, '/forbidden');
    }
    api.get(`/organizations/${id}?includeImage=true`, (err, result) => {
      if (err) {
        snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      this.setState({
        organization: result,
      });
    });
  }

  render() {
    let {organization} = this.state;
    return (
      <div className="box">
        {organization && <Hubs orgId={organization.id} organization={organization}/>}
      </div>)
  }
}

export default HubsWrapper;
