import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

export default class Airtable extends Component {
  constructor(props) {
    super(props);
    this.state = {airtableData: null, notes: '', selectedCollaborator: 0};
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
    let {airtableData, notes, collaborators, selectedCollaborator} = this.state;
    api.post(
      '/airtable/createTicket',
      {
        carId: airtableData.id,
        collaborator: collaborators[selectedCollaborator],
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

  toggleSelect(idx) {
    let temp = [...this.state.collaborators];
    if (!temp[idx].selected) {
      temp[idx].selected = true;
    } else {
      delete temp[idx].selected;
    }
    this.setState({collaborators: temp});
  }

  render() {
    let {airtableData, collaborators, selectedCollaborator} = this.state;
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
                <div className="row" style={{marginTop: '1rem'}}>
                  <h4>Create Airtable Tickets</h4>
                  <div style={{marginTop: '1rem'}}>Select Assignee:</div>
                  <div
                    style={{
                      marginTop: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                    }}>
                    {collaborators.map((each, i) => (
                      <div key={i} style={{width: '25%'}}>
                        <input
                          style={{marginRight: '0.2rem'}}
                          id={`collaborator-${i}`}
                          type="radio"
                          onChange={() =>
                            this.setState({selectedCollaborator: i})
                          }
                          checked={i === selectedCollaborator}
                        />
                        <label htmlFor={`collaborator-${i}`}>{each.name}</label>
                      </div>
                    ))}
                  </div>
                  <div style={{display: 'flex', justifyContent: 'center'}}>
                    <textarea
                      style={{width: '50%', marginTop: '1rem'}}
                      type="text"
                      onInput={e => this.setState({notes: e.target.value})}
                      placeholder={'Enter a task description'}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: '1rem',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}>
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
