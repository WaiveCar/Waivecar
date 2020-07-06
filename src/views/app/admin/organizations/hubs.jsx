import React, {Component} from 'react';
import {Link} from 'react-router';
import {GMap, snackbar} from 'bento-web';
import OrganizationResource from './organization-resource-table';
import ThSort from '../components/table-th';

class Hubs extends Component {
  constructor(props) {
    super(props);
    this.state = {hubs: []};
  }

  render() {
    let {orgId, organization} = this.props;
    let {hubs} = this.state;
    return (
      <div className="box">
        <h2 style={{display: 'flex', justifyContent: 'space-between'}}>
          <Link to={`/organizations/${organization.id}`}>
            {organization.name}
          </Link>
          <Link to={`/organizations/${organization.id}/hubs/create`}>
            create
          </Link>
        </h2>
        <div className="box-content">
          <div className="row" style={{marginBottom: '1.5rem'}}>
            <div className="col-xs-12">
              <div className="map-dynamic">
                <GMap
                  markerIcon={'/images/map/active-waivecar.svg'}
                  markers={hubs}
                  orgId={orgId}
                  forOrg
                />
              </div>
            </div>
          </div>
          <OrganizationResource
            ref="hub-resource"
            resource={'hub'}
            resourceUrl={`/organizations/${orgId}/hubs`}
            organizationId={orgId}
            updateParent={hubs => this.setState({hubs})}
            header={() => (
              <tr ref="sort">
                <ThSort sort="id" value="Id" ctx={this.refs['hub-resource']} />
                <ThSort
                  sort="name"
                  value="Name"
                  ctx={this.refs['hub-resource']}
                />
                <ThSort
                  sort="address"
                  value="Address"
                  ctx={this.refs['hub-resource']}
                />
                <ThSort
                  sort="createdAt"
                  value="Created"
                  ctx={this.refs['hub-resource']}
                />
              </tr>
            )}
            row={hub => (
              <tr key={hub.createdAt}>
                <td>
                  <Link to={`/organizations/${orgId}/hubs/${hub.id}`}>
                    {hub.id}
                  </Link>
                </td>
                <td>{hub.name}</td>
                <td>{hub.address}</td>
                <td>{hub.createdAt}</td>
              </tr>
            )}
          />
        </div>
      </div>
    );
  }
}

export default Hubs;
