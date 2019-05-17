import React, { Component, PropTypes } from 'react';
import { auth, relay, api, dom, helpers } from 'bento';
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
      status  : 'started,reserved,ended,completed,closed',
      offset  : this.state.offset,
      limit   : this.state.limit
    }, (err, bookings) => {
      if (err) {
        return console.log(err);
      }
      if(bookings[0] && ['started','reserved'].indexOf(bookings[0].status) !== -1) {
        this.setState({ currentBooking: bookings[0] });
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
      console.log('bookings: ', bookings);
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
      fee   : data.payments.reduce((value, payment) => value + (payment.status === 'cancelled' ? 0 : (payment.amount - payment.refunded)), 0) / 100,
      id    : data.id,
      data  : data
    };

    // ### Duration

    let duration  = moment.duration(moment((ride.end || {}).createdAt).diff(moment((ride.start || {}).createdAt)));
    ride.duration = {
      raw     : duration,
      days    : duration.days(),
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
            { moment(data.createdAt).format('MMMM D YYYY') }
          </td>
          <td>
            { ride.duration.days ? `${ ride.duration.days }d ` : '' }
            { (ride.duration.hours || ride.duration.days) ? `${ ride.duration.hours }h ` : '' }
            { `${ ride.duration.minutes }m  ` }
          </td>
          <td>
            { data.car ? data.car.license : '(unknown)' }
          </td>
          <td>
            { ride.fee ? `$${ ride.fee.toFixed(2) }` : emptyChargeText }
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
          { this.state.currentBooking ? 
            <em>
              Currently in { 
                this.props.currentUser ?  <b>{this.state.currentBooking.car.license}</b> :
                  <span>
                    <a href={ '/cars/' + this.state.currentBooking.car.id }>{this.state.currentBooking.car.license}</a> <a href={ '/bookings/' + this.state.currentBooking.id }>(booking info)</a> 
                  </span>
              }
            </em>
            : ""
          }
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
