import React, {Component} from 'react';
import {Link} from 'react-router';
import {api, auth} from 'bento';
import {snackbar} from 'bento-web';
import OrganizationResource from './organization-resource-table.jsx';
import ThSort from '../components/table-th';
import moment from 'moment';
import Insurance from './insurance';
import Logo from './logo';
import Statements from './statements';

class Organization extends Component {
  constructor(props) {
    super(props);
    let pathName = window.location.pathname.split('/');
    this._user = auth.user();
    this.state = {
      id: props.id || pathName.pop(),
      users: [],
      cars: [],
      organization: null,
    };
  }

  componentDidMount() {
    let {id} = this.state;
    if (!auth.user().canSee('organization', {id})) {
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
        users: result.users,
        cars: result.cars,
        loaded: true,
      });
    });
  }

  render() {
    let {cars, users, id, organization, loaded} = this.state;
    return loaded ? (
      <div className="box">
        <h3>
          {organization ? organization.name : ''}{' '}
          {this._user.hasAccess('waiveAdmin') && organization ? (
            <Link
              className="pull-right"
              params={{name: organization.name}}
              to={`/organizations/${id}/statements/create?name=${organization.name}`}>
              Create Statement
            </Link>
          ) : (
            ''
          )}
        </h3>
        <div className="box-content">
          {organization && (
            <Logo organization={organization} _user={this._user} />
          )}
          {organization && (
            <Statements _user={this._user} organization={organization} />
          )}
          <h4 style={{marginTop: '1rem'}}>
            <Link to="/users">Recent Users</Link>
          </h4>
          <OrganizationResource
            ref="users-resource"
            resource={'users'}
            resourceUrl={'users'}
            organizationId={id}
            header={() => (
              <tr ref="sort">
                <ThSort
                  sort="id"
                  value="Id"
                  ctx={this.refs['users-resource']}
                />
                <ThSort
                  sort="firstName"
                  value="Name"
                  ctx={this.refs['users-resource']}
                />
              </tr>
            )}
            row={user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  <Link to={`/users/${user.id}`}>
                    {user.firstName} {user.lastName}
                  </Link>
                </td>
              </tr>
            )}
          />
          <h4 style={{marginTop: '1rem'}}>
            <Link to="/cars">Cars in bookings</Link>
          </h4>
          <OrganizationResource
            ref="cars-resource"
            resource={'cars'}
            resourceUrl={'carsWithBookings'}
            queryOpts={'&started=true'}
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
          <h4 style={{marginTop: '1rem'}}>Insurance</h4>
          <Insurance _user={this._user} organizationId={id} />
        </div>
      </div>
    ) : (
      <div id="booking-view">
        <div className="booking-message">Loading ...</div>
      </div>
    );
  }
}

module.exports = Organization;
