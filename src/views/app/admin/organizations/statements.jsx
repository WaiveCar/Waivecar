import React from 'react';
import moment from 'moment';

function Statements({organization}) {
  let {organizationStatements} = organization;
  return (
    <div>
      <h4 style={{marginTop: '1rem'}}>Statements</h4>
      <table className="box-table table-striped">
        <thead>
          <tr>
            <th>Id</th>
            <th>Billing Date</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {organizationStatements.map((statement, i) => 
            <tr>
              <td>{statement.id}</td>
              <td>{moment(statement.billingDate).format('MM/DD/YYYY')}</td>
              <td>{moment(statement.dueDate).format('MM/DD/YYYY')}</td>
              <td>${(statement.amount / 2).toFixed(2)}</td>
              <td>{statement.status}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Statements;
