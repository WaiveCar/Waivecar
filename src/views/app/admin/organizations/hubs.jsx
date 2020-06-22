import React, {Component} from 'react';
import OrganizationResource from './organization-resource-table';
import ThSort from '../components/table-th';

class BaseStations extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {orgId} = this.props
    return (
      <div>
        <OrganizationResource
          ref="hub-resource"
          resource={'hub'}
          resourceUrl={`/organizations/${orgId}/hubs`}
          organizationId={orgId}
          header={() => (
            <tr ref="sort">
              <ThSort sort="id" value="Id" ctx={this.refs['hub-resource']} />
              <ThSort
                sort="firstName"
                value="Name"
                ctx={this.refs['hub-resource']}
              />
            </tr>
          )}
          row={hub => (
            <tr key={hub.createdAt}>
              <td>{hub.createdAt}</td>
              <td>
                {hub.createdAt}
              </td>
            </tr>
          )}
        />
      </div>
    );
  }
}

export default BaseStations;
