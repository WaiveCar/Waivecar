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
    let {orgId, organization, inDash, showTitle} = this.props;
    let {hubs} = this.state;
    return (
      <div className={!inDash || showTitle &&  'box'}>
        {!inDash ? (
          <h3 style={{display: 'flex', justifyContent: 'space-between'}}>
            <Link to={`/organizations/${organization.id}`}>
              {organization.name}
            </Link>
            <Link to={`/organizations/${organization.id}/hubs/create`}>
              create
            </Link>
          </h3>
        ) : (
          <h4 style={{display: 'flex', justifyContent: 'space-between'}}>
            <Link to={`/organizations/${organization.id}/hubs`}>Hubs</Link>
            <Link to={`/organizations/${organization.id}/hubs/create`}>
              create
            </Link>
          </h4>
        )}

        <div className={!inDash || showTitle && 'box-content'}>
          <div className="row" style={{marginBottom: '1.5rem'}}>
            <div className="col-xs-12">
              <div className={inDash ? 'map-short' : 'map-dynamic'}>
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
            ref={`hub-resource-${orgId}`}
            resource={'hubs'}
            resourceUrl={`/organizations/${orgId}/hubs`}
            organizationId={orgId}
            updateParent={hubs => this.setState({hubs})}
            header={() => (
              <tr ref="sort">
                <ThSort
                  sort="id"
                  value="Id"
                  ctx={this.refs[`hub-resource-${orgId}`]}
                />
                <ThSort
                  sort="name"
                  value="Name"
                  ctx={this.refs[`hub-resource-${orgId}`]}
                />
                <ThSort
                  sort="address"
                  value="Address"
                  ctx={this.refs[`hub-resource-${orgId}`]}
                />
                <ThSort
                  sort="createdAt"
                  value="Created"
                  ctx={this.refs[`hub-resource-${orgId}`]}
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
            skipDispatch
          />
        </div>
      </div>
    );
  }
}

export default Hubs;
