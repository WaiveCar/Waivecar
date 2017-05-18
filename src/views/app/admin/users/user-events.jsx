import React from 'react';
import { api } from 'bento';
// ### Components



module.exports = class UsersEvents extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      events: []
    };
  }

  componentDidMount() {
    api.get(`/logs/event?userId=${ this.props.id }`, (err, events) => {
      this.setState({events: events});
    });

  }

  renderEvent(event) {
    return (
      <tr>
        <td>{ moment(event.createdAt).format('MM/DD/YYYY') }</td>
        <td>{event.type}</td>
        <td>{event.comment}</td>
      </tr>
    );
  }

  render() {
    return (

      <div className="user-events">
        <div className="box">
          <h3>
            User's  Events
          </h3>
          <div className="box-content no-padding">

            <table className="table-user-events">
              <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Comment</th>
              </tr>
              </thead>
              <tbody>
                {this.state.events.map(this.renderEvent)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
};
