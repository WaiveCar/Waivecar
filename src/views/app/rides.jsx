'use strict';

import React                              from 'react';
import moment                             from 'moment';
import { auth, relay, api, dom, helpers } from 'bento';
import { Map }                            from 'bento-web';
import RideDetails                        from './ride-details';

module.exports = class ProfileView extends React.Component {

  constructor(...args) {
    super(...args);
    dom.setTitle('My Rides');
    this.state = {
      bookings : [],
      details  : null
    };
    relay.subscribe(this, 'me');
  }

  /**
   * Retrieve list of bookings.
   * @return {Void}
   */
  componentDidMount() {
    api.get('/bookings', {
      order   : 'id,DESC',
      details : true
    }, (err, bookings) => {
      if (err) {
        return console.log(err);
      }
      this.setState({
        bookings : bookings
      });
    });
  }

  /**
   * Returns a booking as tbody
   * @param  {Object} data
   * @return {Object}
   */
  booking(data) {
    let isOpen = this.state.details === data.id;

    // ### Ride

    let ride = {
      start : data.details.find(val => val.type === 'start'),
      end   : data.details.find(val => val.type === 'end'),
      fee   : data.payments.reduce((value, payment) => { return value + (payment.amount - payment.refunded); }, 0) / 100,
    };

    // ### Duration

    let duration  = moment.duration(moment(ride.end.time).diff(moment(ride.start.time)));
    ride.duration = {
      raw     : duration,
      hours   : duration.hours(),
      minutes : duration.minutes(),
      seconds : duration.seconds()
    };

    return (
      <tbody key={ data.id }>
        <tr className="ride-row" onClick={ this.viewDetails.bind(this, data.id) }>
          <td className="text-center">
            {
              isOpen ? <i className="material-icons primary">keyboard_arrow_down</i> : <i className="material-icons">keyboard_arrow_right</i>
            }
          </td>
          <td>
            { moment(data.createdAt).format('DD/MM/YYYY') }
          </td>
          <td>
            { ride.duration.hours ? `${ ride.duration.hours } hour${ ride.duration.hours > 1 ? 's' : '' }` : '' } { `${ ride.duration.minutes } minute${ ride.duration.minutes > 1 ? 's' : '' }` }
          </td>
          <td>
            { data.carId }
          </td>
          <td>
            ${ ride.fee }
          </td>
          <td>
            { helpers.changeCase.toCapital(data.status) }
          </td>
        </tr>
        {
          isOpen ? <RideDetails { ...ride } /> : null
        }
      </tbody>
    );

  }

  viewDetails(bookingId) {
    this.setState({
      details : bookingId === this.state.details ? null : bookingId
    });
  }

  /**
   * Rdner the profile view.
   * @return {Object}
   */
  render() {
    return (
      <div className="rides container">
        <div className="row">
          <div className="col-xs-12">
            <div className="box full">
              <h3>
                My Rides
                <small>
                  Your current, and past ride history.
                </small>
              </h3>
              <div className="box-content no-padding">
                <table className="table-rides">
                  <thead>
                    <tr>
                      <th width="24"></th>
                      <th>Date</th>
                      <th>Duration</th>
                      <th>Car</th>
                      <th>Fee</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  {
                    this.state.bookings.map((data) => {
                      return this.booking(data)
                    })
                  }
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}
