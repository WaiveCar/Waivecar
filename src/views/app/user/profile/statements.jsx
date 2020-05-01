import React from 'react';
import {auth} from 'bento';
import Statements from '../../../app/admin/organizations/statements.jsx';

let _user = auth.user();

function StatementList() {
  console.log(_user.organizations);
  return (
    <div>
      {_user.organizations.map(({organization}, i) => (
        <Statements key={i} _user={_user} organization={organization} />
      ))}
    </div>
  );
}

export default StatementList;
