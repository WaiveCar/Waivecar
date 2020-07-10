import React, {Component} from 'react';
import OrganizationResource from '../organizations/organization-resource-table';
import ThSort from '../components/table-th';
import {Link} from 'react-router';
import {auth} from 'bento';

export default class extends Component {
  constructor(props) {
    super(props);
    this._user = auth.user();
    this.state = {
      query: null,
    };
  }

  search() {
    let {query} = this.state;
    let child = this.refs['cars-resource'];
    child.setState({search: query}, () => child.table.search(null, query));
  }

  render() {
    let {query} = this.state;
    return (
      <div className="cars-index box full">
        <section className="container">
          <h3>Assets</h3>
          <div className="box-content">
            <input
              type="text"
              onChange={e => this.setState({query: e.target.value})}
            />
            <button onClick={() => this.search()}>Click</button>
            <OrganizationResource
              ref="cars-resource"
              resource={'cars'}
              resourceUrl={'carsWithBookings'}
              queryOpts={query}
              organizationIds={this._user.organizations.map(
                org => org.organizationId,
              )}
              header={() => {
                return (
                  <tr ref="sort">
                    <ThSort
                      sort="id"
                      value="Id"
                      ctx={this.refs['cars-resource']}
                    />
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
                    <ThSort
                      sort="organizationName"
                      value="organization"
                      ctx={this.refs['cars-resource']}
                    />
                  </tr>
                );
              }}
              row={car => (
                <tr key={car.id}>
                  <td>{car.id}</td>
                  <td>
                    <Link to={`/cars/${car.id}`}>{car.license}</Link>
                  </td>
                  <td>{car.maintenanceDueIn} miles</td>
                  <td>{car.organizationName}</td>
                </tr>
              )}
            />
          </div>
        </section>
      </div>
    );
  }
}
