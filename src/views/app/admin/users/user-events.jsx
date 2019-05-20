import React from 'react';
import { api } from 'bento';
import moment from 'moment';

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

  renderEvent(event, i) {
    comment = event.comment;
    if (event.type === 'SIT') {
      comment = <span>{ event.comment } minutes for booking <a href={ '/bookings/' + event.referenceId }>#{ event.referenceId }</a></span>
    } 
    if (event.type === 'HOLDING') {
      comment = <a href={ '/users/' + event.referenceId }>{ event.comment }</a>
    }
    if (event.type === 'DECLINED') {
      comment = <a href={ '#charge-' + event.referenceId }>Charge #{ event.referenceId }</a>
    }
    if (event.type === 'PHOTO') {
      comment = <span dangerouslySetInnerHTML={{ __html: event.comment }} />
    }
    return (
      <tr key={i}>
        <td title={ moment(event.createdAt).format('YYYY-MM-DD HH:mm:ss') }>{ moment(event.createdAt).format('MMM D YYYY') }</td>
        <td>{ event.type }</td>
        <td>{ comment }</td>
      </tr>
    );
  }

  render() {
    return (

      <div className="user-events">
        <div className="box">
          <h3>
            Iniquities
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
                {this.state.events.map((event, i) => this.renderEvent(event, i))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
};
