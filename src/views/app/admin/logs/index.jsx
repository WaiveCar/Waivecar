import { History, Link } from 'react-router';
import React from 'react';
import mixin from 'react-mixin';
import moment from 'moment';
import Table from 'bento-service/table';
import { relay, dom } from 'bento';

@mixin.decorate(History)
class LogIndex extends React.Component {

  constructor(...args) {
    super(...args);
    this.table = new Table(this, 'logs', [], '/audit/log');
    this.state = {
      search : null,
      sort : {
        key   : null,
        order : 'DESC'
      },
      more   : false,
      offset : 0
    };
    relay.subscribe(this, 'logs');
  }

  /**
   * Tell table to fetch initial payload
   */
  componentDidMount() {
    dom.setTitle("Logs");
    this.table.init();
    this.setState({
      sort : {
        key   : 'id',
        order : 'ASC'
      },
      searchObj: {
        order: 'id,DESC'
      }
    });
  }

  /**
   * Render log row
   * @param {Object} log
   * @return {Object}
   */
  row(log) {
    return (
      <tr key={ log.id }>
        <td>{ log.id }</td>
        <td>{ this.renderAction(log) }</td>
        <td title={ moment(log.createdAt).format('HH:mm:ss MM-DD-YY') }>{ moment(log.createdAt).fromNow() }</td>
      </tr>
    );
  }

  /**
   * Turn log data into sentence
   * @param {Object} log
   * @return {Object}
   */
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
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> unlocked </span>
            <Link to={ `/cars/${ log.car.id }`}>{ log.car.license || log.car.id }</Link>
          </div>
        );
      case 'LOCK_CAR':
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> locked </span>
            <Link to={ `/cars/${ log.car.id }`}>{ log.car.license || log.car.id }</Link>
          </div>
        );
      case 'IMMOBILIZE_CAR':
        return (
          <div>
            <Link to={ `/users/${ log.actor.id }` }>{ log.actor.firstName } { log.actor.lastName }</Link>
            <span> locked immobilizer on </span>
            <Link to={ `/cars/${ log.car.id }`}>{ log.car.license || log.car.id }</Link>
          </div>
        );
      case 'UNIMMOBILIZE_CAR':
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

  render() {
    console.log(this.state.logs);
    return (
      <div id="bookings-list" className="container">
        <div className="box full">
          <div className="box-content">
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <th>#</th>
                  <th>Action</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                { this.table.index() }
              </tbody>
            </table>
            { !this.state.logs.length ? <h3 style={{ textAlign : 'center', marginTop : 20 }}><em>No logs to display</em></h3> : '' }
            {
              this.state.more ?
                <div className="text-center" style={{ marginTop : 20 }}>
                  <button className="btn btn-primary" onClick={ () => this.table.more(false) }>Load More</button>
                </div>
                :
                ''
            }
          </div>
        </div>
      </div>
    );
  }
}

module.exports = LogIndex;
