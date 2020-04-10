import React, {Component} from 'react';
import {Link} from 'react-router';
import {api} from 'bento';
import {snackbar} from 'bento-web';
import OrganizationCars from './organization-cars.jsx'; 
import OrganizationUsers from './organization-users.jsx'; 

class Organization extends Component {
  constructor(props) {
    super(props);
    let pathName = window.location.pathname.split('/');
    this.state = {
      id: pathName.pop(),
      users: [],
      cars: [],
      organization: null,
    };
  }

  componentDidMount() {
    let {id} = this.state;
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
        <h3>{organization.name}</h3>
        <div className="box-content">
          <h4>Users</h4>
          <OrganizationUsers organizationId={id} />
          <OrganizationCars organizationId={id} />
        </div>
      </div>
    );
  }
}

module.exports = Organization;
