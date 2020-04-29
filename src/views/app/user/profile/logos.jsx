import React, {Component} from 'react';
import {auth} from 'bento';
import {Link} from 'react-router';
import Logo from '../../../app/admin/organizations/logo';

let _user = auth.user();

function Logos() {
  return (
    <div className="box">
      {_user.organizations.length ? (
        _user.organizations.map((org, i) => (
          <div style={{marginTop: '1.25rem'}} key={i}>
            <h3>
              <Link to={`/organizations/${org.organizationId}`}>
                {org.organization.name}
              </Link>
            </h3>
            <div key={i} className="box-content">
              <Logo _user={_user} organization={org.organization} />
            </div>
          </div>
        ))
      ) : (
        <div id="booking-view">
          <div className="booking-message">
            You are not a member of any organizations with group insurance
            policies.
          </div>
        </div>
      )}
    </div>
  );
}

export default Logos;
