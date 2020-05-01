import React, {Component} from 'react';
import moment from 'moment';
import {api} from 'bento';
import {snackbar} from 'bento-web';

class Statements extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      organizationStatements: props.organization.organizationStatements,
    };
    this._user = props._user;
  }

  payStatement(id) {
    console.log('paying', id);
  }

  render() {
    let {organizationStatements} = this.state;
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
              {!this._user.hasAccess('waiveAdmin') ? <th>Pay</th> : ''}
            </tr>
          </thead>
          <tbody>
            {organizationStatements.map((statement, i) => (
              <tr key={i}>
                <td>{statement.id}</td>
                <td>{moment(statement.billingDate).format('MM/DD/YYYY')}</td>
                <td>{moment(statement.dueDate).format('MM/DD/YYYY')}</td>
                <td>${(statement.amount / 2).toFixed(2)}</td>
                <td>{statement.status}</td>
                {!this._user.hasAccess('waiveAdmin') ? (
                  <td>
                    {statement.status === 'outstanding' ? (
                      <div
                        className="btn btn-primary btn-sm"
                        onClick={() => this.payStatement(statement.id)}>
                        Pay
                      </div>
                    ) : (
                      ''
                    )}
                  </td>
                ) : (
                  ''
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Statements;
