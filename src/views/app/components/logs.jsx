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
    let actorLink =  <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
    let bookingLink = '';
    let carLink = '';
    if (log.booking) {
      bookingLink = <Link to={ `/bookings/${ log.booking.id }` }>booking</Link> 
    }
    if (log.car) {
      carLink = <Link to={ `/cars/${ log.car.id }`}>{ log.car.license || log.car.id }</Link>
    }
    let verbMap = {
      REPAIR_START: 'is repairing',
      REPAIR_END: 'fixed',
      CREATE_BOOKING: 'created',
      END_BOOKING: 'ended',
      COMPLETE_BOOKING: 'completed',
      UNLOCK_CAR: 'unlocked',
      UNLOCK: 'unlocked',
      LOCK_CAR: 'locked',
      LOCK: 'locked',
      IMMOBILIZE_CAR: 'immobilized',
      IMMOBILIZE: 'immobilized',
      UNIMMOBILIZE_CAR: 'unimmobilized',
      UNIMMOBILIZE: 'unimmobilized',
      MAKE_CAR_AVAILABLE: 'available',
      MAKE_CAR_UNAVAILABLE: 'unavailable',
      RETRIEVE: 'retrieved',
      RENTABLE: 'rentable'
    }
    let verb = verbMap[log.action];

    switch(log.action) {
      case 'CREATE_BOOKING':
      case 'END_BOOKING':
      case 'COMPLETE_BOOKING':
        let who = '';
        if(log.user.id !== log.actor.id) {
          who = <span> for <Link to={ `/users/${ log.user.id }` }>{ log.user.firstName } { log.user.lastName }</Link></span>
        }
        return (
          <div>
            { actorLink } { verb } a { bookingLink } { who }
          </div>
        );
      case 'UNLOCK_CAR':
      case 'UNLOCK':
      case 'LOCK_CAR':
      case 'LOCK':
      case 'IMMOBILIZE_CAR':
      case 'IMMOBILIZE':
      case 'UNIMMOBILIZE_CAR':
      case 'UNIMMOBILIZE':
      case 'REPAIR_START':
      case 'REPAIR_END':
      case 'RETRIEVE':
        return (
          <div>
            { actorLink } { verb } { carLink }
          </div>
        );
      case 'MAKE_CAR_AVAILABLE':
      case 'MAKE_CAR_UNAVAILABLE':
      case 'RENTABLE':
        return (
          <div>
            { actorLink } made { carLink } { verb }
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
