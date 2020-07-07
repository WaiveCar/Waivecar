import React from 'react';
import {auth} from 'bento';
import Hubs from './hubs';
import Link from 'react-router';

function MultiHub() {
  let _user = auth.user();
  return (
    <div className="box">
      <h1>Hubs</h1>
      {_user.organizations.length ? (
        _user.organizations.map((org, i) => (
          <div key={i}>
            <div key={i} className="box-content">
              <Hubs
                key={i}
                organization={org.organization}
                orgId={org.organizationId}
              />
            </div>
          </div>
        ))
      ) : (
        <div id="booking-view">
          <div className="booking-message">
            You are not a member of any organizations.
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiHub;
