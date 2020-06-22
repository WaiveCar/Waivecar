import React, {Component} from 'react';
import {GMap, snackbar, api} from 'bento-web';
import OrganizationResource from './organization-resource-table';
import ThSort from '../components/table-th';

class BaseStations extends Component {
  constructor(props) {
    super(props);
    this.state = {hubs: []};
  }

  render() {
    let {orgId} = this.props;
    let {hubs} = this.state;
    return (
      <div className="box">
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
                  sort="createdAt"
                  value="Created"
                  ctx={this.refs['hub-resource']}
                />
              </tr>
            )}
            row={hub => (
              <tr key={hub.createdAt}>
                <td>{hub.id}</td>
                <td>{hub.name}</td>
                <td>{hub.createdAt}</td>
              </tr>
            )}
          />
        </div>
      </div>
    );
  }
}

export default BaseStations;
