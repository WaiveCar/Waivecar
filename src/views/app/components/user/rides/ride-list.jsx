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
      offset  : 0,
      limit   : 15,
      details : null,
      btnPrev : false,
      btnNext : true
    };

    this.booking = this.booking.bind(this);
  }

  componentDidMount() {
    // Fetch list of bookings
    api.get('/bookings', {
      userId  : this.props.user.id,
      order   : 'id,DESC',
      details : true,
      status  : 'ended,completed,closed',
      offset  : this.state.offset,
      limit   : this.state.limit
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

  getBookings(step, cb) {
    api.get('/bookings', {
      userId  : this.props.user.id,
      order   : 'id,DESC',
      details : true,
      status  : 'ended,completed,closed',
      offset  : this.state.offset + (this.state.limit * step),
      limit   : this.state.limit
    }, (err, bookings) => {
      if (err) {
        return console.log(err);
      }
      cb(bookings);
    });
  }

  prevPage() {
    if (this.state.btnPrev) {
      var self = this;
      this.getBookings(-1, function(bookings){
        if (bookings.length > 0){
          self.setState({
            bookings : bookings,
            offset : self.state.offset - self.state.limit,
            btnNext : true
          }, function(){
            if (self.state.offset == 0){
              self.setState({btnPrev : false});
            }
          });
        }
      });
    }
  }

  nextPage() {
    if (this.state.btnNext) {
      var self = this;
      this.getBookings(1, function (bookings) {
        if (bookings.length > 0) {
          self.setState({
            bookings: bookings,
            offset: self.state.offset + self.state.limit,
            btnPrev: true
          });
        }
        if (bookings.length < 15) {
          self.setState({btnNext: false});
        }
      });
    }
  }

  /**
   * Returns a booking as tbody
   * @param  {Object} data
   * @return {Object}
   */
  booking(data) {
    let isOpen = this.state.details === data.id;
    let isFailed = data.payments.filter(val => val.status === 'failed').length;
    let className = ['ride-row'];
    let emptyChargeText = 'No Charge';
    let status = data.status;

    // ### Ride

    let ride = {
      start : data.details.find(val => val.type === 'start'),
      end   : data.details.find(val => val.type === 'end'),
      fee   : data.payments.reduce((value, payment) => { return value + (payment.amount - payment.refunded); }, 0) / 100,
      id    : data.id
    };

    // ### Duration

    let duration  = moment.duration(moment((ride.end || {}).createdAt).diff(moment((ride.start || {}).createdAt)));
    ride.duration = {
      raw     : duration,
      hours   : duration.hours(),
      minutes : duration.minutes(),
      seconds : duration.seconds()
    };


    if(isFailed) {
      className.push('failed-row');
      status = 'Failed Charge';
      ride.failed = true;
    }

    // If it was over 2 hours then it may have been
    // a failed charge, so we cover that use-case here.
    if(ride.duration.hours > 2 && !ride.fee) {
      emptyChargeText = 'No/Failed Charge';
    }

    return (
      <tbody key={ data.id }>
        <tr className={ className.join(' ') } onClick={ this.viewDetails.bind(this, data.id) }>
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
            { ride.fee ? `$${ ride.fee }` : emptyChargeText }
          </td>
          <td className='status hidden-md-down'>
            { helpers.changeCase.toCapital(status) }
          </td>
        </tr>
        {
          isOpen ? <RideDetails { ...ride } /> : null
        }
      </tbody>
    );

  }

  render() {
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
            !this.state.bookings.length ?
              <div className="text-center" style={{ padding : '20px 0px' }}>
                { this.props.currentUser ? 'You currently have' : 'User currently has' }  no past rides.
              </div>
              :
              <div>
                <table className="table-rides">
                  <thead>
                    <tr>
                      <th width="24"></th>
                      <th>Date</th>
                      <th>Duration</th>
                      <th>Car</th>
                      <th>Fee</th>
                      <th className='hidden-md-down'>Status</th>
                    </tr>
                  </thead>
                  { this.state.bookings.map(this.booking) }
                 </table>
                 <div className='pull-right'>
                   <button className={'btn btn-sm ' + (this.state.btnPrev ? 'btn-primary' : 'disabled')} onClick = { this.prevPage.bind(this) }>Previous</button>&nbsp; &nbsp;
                   <button className={'btn btn-sm ' + (this.state.btnNext ? 'btn-primary' : 'disabled')} onClick = { this.nextPage.bind(this) }>Next</button>
                 </div>
               </div>

          }
        </div>
      </div>
    );
  }
}

module.exports = RideList;
