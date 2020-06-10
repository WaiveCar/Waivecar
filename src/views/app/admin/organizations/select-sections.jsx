import React, {Component} from 'react';
import {api, auth} from 'bento';
import {Link} from 'react-router';
import {Form, snackbar} from 'bento-web';

let initialSections = {
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
    let initialState = {};
    this._user.organizations.forEach(org => {
      let sections = {};
      if (org.organization.sections) {
        let json = JSON.parse(org.organization.sections);
        Object.keys(json).forEach(key => {
          sections[key] = json[key];
        });
      } else {
        sections = initialSections;
      }
      initialState[org.organizationId] = sections;
    });
    this.state = {orgs: initialState};
  }

  updateField(id, key, checked) {
    let {orgs} = this.state;
    let toUpdate = {...orgs[id]};
    toUpdate[key] = !checked;
    this.setState({
      orgs: {...orgs, [id]: toUpdate},
    });
  }

  updateOrg(id, e) {
    e.preventDefault();
    api.put(
      `/organizations/${id}`,
      {sections: JSON.stringify(this.state.orgs[id])},
      (err, res) => {
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
      },
    );
  }

  render() {
    let {orgs} = this.state;
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
                <form onSubmit={e => this.updateOrg(org.organizationId, e)}>
                  {Object.keys(initialSections).map((key, i) => (
                    <div key={i}>
                      <input
                        type="checkbox"
                        checked={orgs[org.organizationId][key]}
                        id={`${org.orgainzation}-${key}`}
                        onChange={e =>
                          this.updateField(
                            org.organizationId,
                            key,
                            orgs[org.organizationId][key],
                            e,
                          )
                        }
                      />
                      <label
                        style={{marginLeft: '0.5rem'}}
                        htmlFor={`${org.orgainzation}-${key}`}>
                        {key}
                      </label>
                    </div>
                  ))}
                  <input
                    type="submit"
                    className="btn btn-primary"
                    name="update"
                  />
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
