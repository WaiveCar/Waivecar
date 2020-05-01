import React, {Component} from 'react';
import moment from 'moment';
import {api} from 'bento';
import {snackbar} from 'bento-web';

class Statements extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationStatements: props.organization.organizationStatements,
    };
    this._user = props._user;
  }

  payStatement(id) {
    let {organizationStatements} = this.state;
    api.put(`/organizations/statements/pay/${id}`, {}, (err, res) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      let temp = [...organizationStatements];
      let idx = temp.findIndex(s => s.id === res.id);
      temp[idx] = res;
      this.setState({organizationStatements: temp}, () =>
        snackbar.notify({
          type: 'success',
          message: 'Statement Paid',
        }),
      );
    });
  }

  render() {
    let {organizationStatements} = this.state;
    console.log(organizationStatements);
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
                <td>${(statement.amount / 100).toFixed(2)}</td>
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
