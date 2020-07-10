import React, {Component} from 'react';
import OrganizationResource from '../organizations/organization-resource-table';
import ThSort from '../components/table-th';
import {Link} from 'react-router';
import {auth} from 'bento';
import moment from 'moment';

export default class extends Component {
  constructor(props) {
    super(props);
    this._user = auth.user();
  }

  search(val) {
    let child = this.refs['assets-resource'];
    child.setState({search: val}, () =>
      child.table.search(
        null,
        this.refs['search-input'].value,
        this.refs['search-input'],
      ),
    );
  }

  render() {
    return (
      <div className="assets-index box full">
        <section className="container">
          <h3>Fridges</h3>
          <div className="box-content">
            <div className="row">
              <div className="col-md-12">
                <input
                  type="text"
                  ref="search-input"
                  onChange={e => this.search({query: e.target.value})}
                  className="form-control box-table-search"
                  placeholder="search"
                />
              </div>
            </div>
            <OrganizationResource
              ref="assets-resource"
              resource={'assets'}
              resourceUrl={'carsWithBookings'}
              queryOpts={'&type=fridge'}
              organizationIds={this._user.organizations.map(
                org => org.organizationId,
              )}
              header={() => {
                return (
                  <tr ref="sort">
                    <ThSort
                      sort="id"
                      value="Id"
                      ctx={this.refs['assets-resource']}
                    />
                    <ThSort
                      sort="license"
                      value="Name"
                      ctx={this.refs['assets-resource']}
                    />
                    <ThSort
                      sort="organizationName"
                      value="Organization"
                      ctx={this.refs['assets-resource']}
                    />
                    <ThSort
                      sort="temp"
                      value="Temperature"
                      ctx={this.refs['assets-resource']}
                    />
                    <ThSort
                      sort="fridgeDoor"
                      value="Door"
                      ctx={this.refs['assets-resource']}
                    />
                    <ThSort
                      sort="updatedAt"
                      value="Last Updated"
                      ctx={this.refs['assets-resource']}
                    />
                  </tr>
                );
              }}
              row={car => (
                <tr key={car.id}>
                  <td>
                    <Link to={`/fridges/${car.id}`}>{car.id}</Link>
                  </td>
                  <td>
                    <Link to={`/fridges/${car.id}`}>{car.license}</Link>
                  </td>
                  <td>
                    {car.organization ? (
                      <Link to={`/organizations/${car.organization.id}`}>
                        {car.organizationName}
                      </Link>
                    ) : (
                      'none'
                    )}
                  </td>
                  <td>{car.temp}</td>
                  <td>{car.fridgeDoor}</td>
                  <td>
                    {moment(car.updatedAt).format('MM/DD/YYYY HH:MM')}
                  </td>
                </tr>
              )}
            />
          </div>
        </section>
      </div>
    );
  }
}
