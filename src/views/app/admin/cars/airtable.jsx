import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

export default class Airtable extends Component {
  constructor(props) {
    super(props);
    this.state = {airtableData: null, notes: ''};
  }

  componentDidMount() {
    let {car} = this.props;
    api.get('/airtable/users', (err, result) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      this.setState({
        collaborators: result,
        airtableData: JSON.parse(car.airtableData),
      });
    });
  }

  createTicket() {
    let {airtableData, notes} = this.state;
    api.post(
      '/airtable/createTicket',
      {
        carId: airtableData.id,
        notes,
      },
      (err, result) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        return snackbar.notify({
          type: 'success',
          message: 'Ticket created',
        });
      },
    );
  }

  refreshAirtable() {
    api.get('/airtable/refresh', (err, res) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      window.location.reload();
      return snackbar.notify({
        type: 'success',
        message: 'Airtable data refreshed successfully',
      });
    });
  }

  render() {
    let {airtableData, collaborators} = this.state;
    return (
      <div className="logs">
        <div className="box">
          <h3>Data From Airtable</h3>
          <div>
            <button
              className="btn btn-primary"
              onClick={() => this.refreshAirtable()}>
              Refresh
            </button>
          </div>

          <div className="box-content">
            {airtableData ? (
              <div>
                <table className="table-logs">
                  <thead>
                    <tr ref="sort">
                      <th>Property</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(airtableData.fields).map((key, i) => (
                      <tr key={i}>
                        <td>{key}</td>
                        <td>
                          {typeof airtableData.fields[key] !== 'object'
                            ? typeof airtableData.fields[key] !== 'boolean'
                              ? airtableData.fields[key]
                              : airtableData.fields[key].toString()
                            : airtableData.fields[key].join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="row">
                  <h4>Create Tickets</h4>
                  <textarea
                    type="text"
                    onInput={e => this.setState({notes: e.target.value})}
                  />
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    {collaborators.map((each, i) => <div key={i}>{each.name}</div>)}
                  </div>
                  <div>
                    <button
                      className="btn btn-primary"
                      onClick={() => this.createTicket()}>
                      Create Ticket
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>No Airtable Data Found</div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
