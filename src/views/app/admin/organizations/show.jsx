import React, {Component} from 'react';
import {Link} from 'react-router';
import {api, auth} from 'bento';
import {snackbar} from 'bento-web';
import OrganizationResource from './organization-resource-table.jsx';
import ThSort from '../components/table-th';
import moment from 'moment';
import Insurance from './insurance.jsx';

class Organization extends Component {
  constructor(props) {
    super(props);
    let pathName = window.location.pathname.split('/');
    this.state = {
      id: pathName.pop(),
      users: [],
      cars: [],
      organization: {},
    };
  }

  componentDidMount() {
    let {id} = this.state;
    if (!auth.user().canSee('organization', {id})) {
      return this.props.history.replaceState({}, '/forbidden');
    }
    api.get(`/organizations/${id}`, (err, result) => {
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
      });
    });
  }

  render() {
    let {cars, users, id, organization} = this.state;
    return (
      <div className="box">
        <h3>{organization ? organization.name : ''}</h3>
        <div className="box-content">
          <h4>Users</h4>
          <OrganizationResource
            resource={'users'}
            resourceUrl={'users'}
            organizationId={id}
            header={() => (
              <tr ref="sort">
                <ThSort sort="id" value="Id" ctx={this} />
                <ThSort sort="firstName" value="Name" ctx={this} />
                <ThSort
                  sort="createdAt"
                  value="Date"
                  ctx={this}
                  className="hidden-sm-down"
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
                <td className="hidden-sm-down">
                  {moment(user.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </td>
              </tr>
            )}
          />
          <h4 style={{marginTop: '1rem'}}>Cars</h4>
          <OrganizationResource
            resource={'cars'}
            resourceUrl={'carsWithBookings'}
            organizationId={id}
            header={() => (
              <tr ref="sort">
                <ThSort sort="id" value="Id" ctx={this} />
                <ThSort sort="license" value="Name" ctx={this} />
                <ThSort
                  sort="createdAt"
                  value="Date"
                  ctx={this}
                  className="hidden-sm-down"
                />
              </tr>
            )}
            row={car => (
              <tr key={car.id}>
                <td>{car.id}</td>
                <td>
                  <Link to={`/cars/${car.id}`}>{car.license}</Link>
                </td>
                <td className="hidden-sm-down">
                  {moment(car.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </td>
              </tr>
            )}
          />
          <h4 style={{marginTop: '1rem'}}>Insurance</h4>
          <Insurance _user={this._user} organizationId={id} />
        </div>
      </div>
    );
  }
}

module.exports = Organization;
