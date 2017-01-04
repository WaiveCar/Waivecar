import React, { Component, PropTypes } from 'react';
import { auth, relay, api, dom, helpers } from 'bento';
import { Map } from 'bento-web';
import moment from 'moment';
import classNames from 'classnames';
import RideDetails from './ride-details';

class RideList extends Component {

  static propTypes = {
    user: PropTypes.object.isRequired,
    currentUser: PropTypes.bool,
    full: PropTypes.bool
  }

  static defaultProps = {
    currentUser: true,
    full: true
  }

  constructor(...options) {
    super(...options);
    this.state = {
      bookings : [],
      details  : null
    };

    this.booking = this.booking.bind(this);
  }

  componentDidMount() {
    // Fetch list of bookings
    api.get('/bookings', {
      userId  : this.props.user.id,
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

  viewDetails(bookingId) {
    this.setState({
      details : bookingId === this.state.details ? null : bookingId
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

    let duration  = moment.duration(moment((ride.end || {}).createdAt).diff(moment((ride.start || {}).createdAt)));
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
            { moment(data.createdAt).format('MM/DD/YYYY') }
          </td>
          <td>
            { ride.duration.hours ? `${ ride.duration.hours } hour${ ride.duration.hours > 1 ? 's ' : ' ' }` : ' ' }
            { `${ ride.duration.minutes } minute${ ride.duration.minutes > 1 ? 's' : '' }` }
          </td>
          <td>
            { data.car ? data.car.license : '(unknown)' }
          </td>
          <td>
            { ride.fee ? `$${ ride.fee }` : 'No Charge' }
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

  render() {
    let pastRides = this.state.bookings.filter(b => [ 'ended', 'completed', 'finalized', 'closed'].includes(b.status));
    var boxClass = classNames({
      box: true,
      full: this.props.full
    });
    return (
      <div className={ boxClass }>
        <h3>
          { this.props.currentUser ? 'My' : 'User\'s' } Rides
          <small>
            { this.props.currentUser ? 'Your' : 'User\'s' } current and past ride history.
          </small>
        </h3>
        <div className="box-content no-padding">
          {
            !pastRides.length ?
              <div className="text-center" style={{ padding : '20px 0px' }}>
                { this.props.currentUser ? 'You currently have' : 'User currently has' }  no past rides.
              </div>
              :
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
                { pastRides.map(this.booking) }
              </table>
          }
        </div>
      </div>
    );
  }
}

module.exports = RideList;
