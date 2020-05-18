import React, {Component} from 'react';
import moment from 'moment';
import {api, auth} from 'bento';
import {snackbar} from 'bento-web';

class Statements extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationStatements: props.organization.organizationStatements,
    };
    this._user = props._user || auth.user();
  }

  payStatement(id) {
    let {organizationStatements} = this.state;
    if (confirm('Are you sure you want to pay this statement?')) {
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
  }

  deleteStatement(id) {
    let {organizationStatements} = this.state;
    let {hideHeader} = this.props;
    if (confirm('Are you sure you want to delete this statement?')) {
      api.delete(`/organizations/statements/pay/${id}`, (err, res) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        let temp = [...organizationStatements];
        let idx = temp.findIndex(s => s.id === res.id);
        temp.splice(idx, 1);
        this.setState({organizationStatements: temp}, () =>
          snackbar.notify({
            type: 'success',
            message: 'Statement Deleted',
          }),
        );
      });
    }
  }

  render() {
    let {organizationStatements} = this.state;
    let {hideHeader} = this.props;
    return (
      <div>
        {!hideHeader && <h4 style={{marginTop: '1rem'}}>Statements</h4>}
        <table className="box-table table-striped">
          <thead>
            <tr>
              <th>Id</th>
              <th>Billing Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid Date</th>
              {!this._user.hasAccess('waiveAdmin') ? (
                <th>Pay</th>
              ) : (
                <th>Delete</th>
              )}
            </tr>
          </thead>
          <tbody>
            {organizationStatements.length ? (
              organizationStatements.map((statement, i) => (
                <tr key={i}>
                  <td>{statement.id}</td>
                  <td>{moment(statement.billingDate).format('MM/DD/YYYY')}</td>
                  <td>{moment(statement.dueDate).format('MM/DD/YYYY')}</td>
                  <td>${(statement.amount / 100).toFixed(2)}</td>
                  <td>{statement.status}</td>
                  <td>
                    {statement.paidDate
                      ? moment(statement.paidDate).format('MM/DD/YYYY')
                      : 'Not Paid'}
                  </td>
                  {!this._user.hasAccess('waiveAdmin') ? (
                    <td>
                      {statement.status === 'outstanding' ? (
                        <div
                          className="btn btn-primary btn-sm"
                          onClick={() => this.payStatement(statement.id)}>
                          Pay
                        </div>
                      ) : (
                        'paid'
                      )}
                    </td>
                  ) : (
                    <td>
                      {statement.status === 'outstanding' ? (
                        <div
                          className="btn btn-danger btn-sm"
                          onClick={() => this.deleteStatement(statement.id)}>
                          Delete
                        </div>
                      ) : (
                        'paid'
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No Statements Yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Statements;
