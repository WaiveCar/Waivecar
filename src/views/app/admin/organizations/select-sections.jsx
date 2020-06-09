import React, {Component} from 'react';
import {api, auth} from 'bento';
import {Link} from 'react-router';
import {Form, snackbar} from 'bento-web';

let sections = {
  bookingInfo: true,
  registration: true,
  personal: true,
  license: true,
  password: true,
  createBooking: true,
};

class SelectSections extends Component {
  constructor(props) {
    super(props);
    this._user = auth.user();
  }

  updateOrg(id, payload) {
    api.put(`/organizations/${id}`, (err, res) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      return snackbar.notify({
        type: 'success',
        message: 'Organization Updated',
      });
    });
  }

  render() {
    return (
      <div className="box">
        <h1>Sections for users of WaiveWork.com</h1>
        {this._user.organizations.length ? (
          this._user.organizations.map((org, i) => (
            <div style={{marginTop: '1.25rem'}} key={i}>
              <h3>
                <Link to={`/organizations/${org.organizationId}`}>
                  {org.organization.name}
                </Link>
              </h3>
              <div key={i} className="box-content">
                <form>
                  {org.organization.sections
                    ? JSON.parse(org.organization.sections).map(section => (
                        <div></div>
                      ))
                    : Object.keys(sections).map(section => <div></div>)}
                </form>
              </div>
            </div>
          ))
        ) : (
          <div id="booking-view">
            <div className="booking-message">
              You are not a member of any organizations with logos.
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default SelectSections;
