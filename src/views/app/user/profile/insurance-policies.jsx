import React from 'react';
import {auth} from 'bento';
import Insurance from '../../../app/admin/organizations/insurance.jsx';

let _user = auth.user();
console.log(_user);
function InsurancePolicies() {
  return <div className="box">
    {_user.organizations.map((org, i) => <Insurance _user={_user} organizationId={org.organizationId} />)}
    </div>
}

export default InsurancePolicies;
