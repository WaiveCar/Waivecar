import React from 'react';
import {auth} from 'bento';
import {Link} from 'react-router';
import Insurance from '../../../app/admin/organizations/insurance.jsx';

let _user = auth.user();

function InsurancePolicies() {
  return (
    <div className="box">
      <h1>Insurance Policies</h1>
      {_user.organizations.length ? (
        _user.organizations.map((org, i) => (
          <div style={{marginTop: '1.25rem'}} key={i}>
            <h3>
              <Link to={`/organizations/${org.organizationId}`}>
                {org.organization.name}
              </Link>
            </h3>
            <div key={i} className="box-content">
              <Insurance _user={_user} organizationId={org.organizationId} />
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

export default InsurancePolicies;
