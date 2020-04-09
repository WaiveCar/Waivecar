import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

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
    let {cars, users} = this.state;
    return (
      <div>
        Orgs Show
        <h4>Users</h4>
        {users.map((each, i) => (
          <div key={i}>
            {each.firstName} {each.lastName}
          </div>
        ))}
        <h4>Cars</h4>
        {cars.map((each, i) => (
          <div key={i}>
            {each.id} {each.license}
          </div>
        ))}
      </div>
    );
  }
}

module.exports = Organization;
