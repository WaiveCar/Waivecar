import React, {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

export default class Airtable extends Component {
  constructor(props) {
    super(props);
    this.state = {airtableData: null};
  }

  componentDidMount() {
    let {car} = this.props;
    this.setState({airtableData: JSON.parse(car.airtableData)});
  }

  createTicket() {
    api.post('/cars/createAirtableTicket', {}, (err, result) => {
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
    });
  }

  render() {
    let {airtableData} = this.state;
    return (
      <div className="logs">
        <div className="box">
          <h3>Data From Airtable </h3>
          <button onClick={() => this.createTicket()}>Create</button>
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
