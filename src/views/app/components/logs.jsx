import React from 'react';
import { api } from 'bento';
import { Link } from 'react-router';
import moment from 'moment';

module.exports = class Logs extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      logs: [],
      offset  : 0
    };

    this.limit = 15;
  }

  componentDidMount() {
   this.queryLogs(0);
  }

  queryLogs(offset) {
    let query = {
      order  : 'created_at,DESC',
      offset  : offset,
      limit   : this.limit
    };
    if (this.props.userId ) {
      query.actorId = this.props.userId;
    }

    if (this.props.carId ) {
      query.carId = this.props.carId;
    }

    api.get(`/audit/log`, query, (err, logs) => {
      this.setState({logs: logs, offset: offset});
    });
  }


  nextLogs() {
    this.queryLogs(this.state.offset - this.limit);
  }

  prevLogs() {
    this.queryLogs(this.state.offset + this.limit);
  }

  renderAction(log) {
    switch(log.action) {
      case 'CREATE_BOOKING':
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> created a </span>
            <Link to={ `/bookings/${ log.booking.id }` }>booking</Link>
            <span> for </span>
            <Link to={ `/users/${ log.actor.id }` }>{ log.user.firstName } { log.user.lastName }</Link>
          </div>
        );
      case 'END_BOOKING':
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> ended a </span>
            <Link to={ `/bookings/${ log.booking.id }` }>booking</Link>
            <span> for </span>
            <Link to={ `/users/${ log.actor.id }` }>{ log.user.firstName } { log.user.lastName }</Link>
          </div>
        );
      case 'COMPLETE_BOOKING':
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> completed a </span>
            <Link to={ `/bookings/${ log.booking.id }` }>booking</Link>
            <span> for </span>
            <Link to={ `/users/${ log.actor.id }` }>{ log.user.firstName } { log.user.lastName }</Link>
          </div>
        );
      case 'UNLOCK_CAR':
      case 'UNLOCK':
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> unlocked </span>
            <Link to={ `/cars/${ log.car.id }`}>{ log.car.license || log.car.id }</Link>
          </div>
        );
      case 'LOCK_CAR':
      case 'LOCK':
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> locked </span>
            <Link to={ `/cars/${ log.car.id }`}>{ log.car.license || log.car.id }</Link>
          </div>
        );
      case 'IMMOBILIZE_CAR':
      case 'IMMOBILIZE':
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> locked immobilizer on </span>
            <Link to={ `/cars/${ log.car.id }`}>{ log.car.license || log.car.id }</Link>
          </div>
        );
      case 'UNIMMOBILIZE_CAR':
      case 'UNIMMOBILIZE':
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> unlocked immobilizer on </span>
            <Link to={ `/cars/${ log.car.id }`}>{ log.car.license || log.car.id }</Link>
          </div>
        );
      case 'MAKE_CAR_AVAILABLE':
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> made </span>
            <Link to={ `/cars/${ log.car.id }`}>{ log.car.license || log.car.id }</Link>
            <span> available </span>
          </div>
        );
      case 'MAKE_CAR_UNAVAILABLE':
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> made </span>
            <Link to={ `/cars/${ log.car.id }`}>{ log.car.license || log.car.id }</Link>
            <span> unavailable </span>
          </div>
        );
      default:
        return log.action;
    }
  }

  renderLog(log) {

    return (
      <tr key={ log.id }>
        <td>{ moment(log.createdAt).format('HH:mm MMM D') }</td>
        <td>{ this.renderAction(log) }</td>
      </tr>
    );

  }

  render() {
    return (

      <div className="logs">
        <div className="box">
          <h3>
            Event Log
          </h3>
          <div className="box-content no-padding">

            <table className="table-logs">
              <thead>
              <tr ref="sort">
                <th>Date</th>
                <th>Action</th>
              </tr>
              </thead>
              <tbody>
                {this.state.logs.map(this.renderLog.bind(this))}
              </tbody>
            </table>

            <div className='pull-right'>
              <button className={'btn btn-sm ' + (this.state.offset > 0 ? 'btn-primary' : 'disabled')} onClick = { this.nextLogs.bind(this) }>Previous</button>&nbsp; &nbsp;
              <button className={'btn btn-sm ' + (this.state.logs.length == this.limit ? 'btn-primary' : 'disabled')} onClick = { this.prevLogs.bind(this) }>Next</button>
            </div>

          </div>
        </div>
      </div>
    );
  }
};
