import React, {Component} from 'react';
import OrganizationResource from './organization-resource-table.jsx';
import {auth, api} from 'bento';

class Hub extends Component {
  constructor(props) {
    super(props);
    this._user = auth.user();
  }

  componentDidMount() {
    let {id, hubId} = this.props.params;
    if (!this._user.canSee('organization', {id})) {
      return this.props.history.replaceState({}, '/forbidden');
    }
    api.get(`/locations/${hubId}`, (err, res) => {
      if (err) {
        console.log(err);
      }
      console.log(res);
    });
  }

  render() {
    return <div>Hub</div>;
  }
}

export default Hub;
