import React, {Component} from 'react';
import {api, auth} from 'bento';
import {Link} from 'react-router';

class SelectSections extends Component {
  constructor(props) {
    super(props);
    this._user = auth.user();
  }

  updateOrg() {}

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
    </div>)
  }
}

export default SelectSections;
