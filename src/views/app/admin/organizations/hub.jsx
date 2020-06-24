import React, {Component} from 'react';
import ThSort from '../components/table-th';
import {Link} from 'react-router';
import OrganizationResource from './organization-resource-table.jsx';
import {auth, api} from 'bento';

class Hub extends Component {
  constructor(props) {
    super(props);
    let {id, hubId} = this.props.params;
    this.state = {
      location: null,
      id,
      hubId,
    };
    this._user = auth.user();
  }

  componentDidMount() {
    let {id, hubId} = this.state;
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
    let {id, hubId} = this.state;
    return (
      <div className="box">
        <h3></h3>
        <div className="box-content">
          <OrganizationResource
            ref="cars-resource"
            resource={'cars'}
            resourceUrl={'carsWithBookings'}
            queryOpts={'&incomplete=true'}
            organizationId={id}
            header={() => (
              <tr ref="sort">
                <ThSort sort="id" value="Id" ctx={this.refs['cars-resource']} />
                <ThSort
                  sort="license"
                  value="Name"
                  ctx={this.refs['cars-resource']}
                />
                <ThSort
                  sort="maintenanceDueIn"
                  value="Maintenance Due In"
                  ctx={this.refs['cars-resource']}
                />
              </tr>
            )}
            row={car => (
              <tr key={car.id}>
                <td>{car.id}</td>
                <td>
                  <Link to={`/cars/${car.id}`}>{car.license}</Link>
                </td>
                <td>{car.maintenanceDueIn} miles</td>
              </tr>
            )}
          />
        </div>
      </div>
    );
  }
}

export default Hub;
