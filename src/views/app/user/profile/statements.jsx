import React from 'react';
import {Link} from 'react-router';
import {auth} from 'bento';
import Statements from '../../../app/admin/organizations/statements.jsx';

let _user = auth.user();

function StatementList() {
  return (
    <div className="box">
      <h1>Statements</h1>
      {_user.organizations.length ? (
        _user.organizations.map((org, i) => (
          <div style={{marginTop: '1.25rem'}} key={i}>
            <h3>
              <Link to={`/organizations/${org.organizationId}`}>
                {org.organization.name}
              </Link>
            </h3>
            <div key={i} className="box-content">
              <Statements key={i} _user={_user} organization={org.organization} hideHeader={true}/>
            </div>
          </div>
        ))
      ) : (
        <div id="booking-view">
          <div className="booking-message">
            You are not a member of any organizations with any statements.
          </div>
        </div>
      )}
    </div>
  );
}

export default StatementList;
