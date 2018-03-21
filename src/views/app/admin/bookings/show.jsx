import React                   from 'react';
import { api, relay, helpers } from 'bento';
import { Link }                from 'react-router';
import BookingFees             from './fees';
import BookingPayment          from './payment';
import BookingDetails          from './details';
import { snackbar }         from 'bento-web';
import NotesList from '../components/notes/list';
import UserLicense from '../users/user-license';
import moment            from 'moment';

module.exports = class BookingsView extends React.Component {

  /**
   * Subscribe to the bookings relays.
   * @param  {...[type]} args [description]
   * @return {[type]}         [description]
   */
  constructor(...args) {
    super(...args);
    this.state = {
      isActing : false,
      force    : false,
      error    : null,
      items    : [],
      carPath  : [],
      reservationTime: 10
    };

    this.handleInputChange = this.handleInputChange.bind(this);

    relay.subscribe(this, 'bookings');
  }

  /**
   * Unsubscribe from the bookings relay.
   * @return {Void}
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'bookings');
  }

  /**
   * Fetches the requested booking.
   * @return {Void}
   */
  componentDidMount() {
    this.loadBooking(this.props.params.id);
    this.loadCarPath(this.props.params.id)
  }

  /**
   * Loads booking.
   * @param  {Number} id
   * @return {Void}
   */
  loadBooking(id) {
    api.get(`/bookings/${ id }`, (err, booking) => {
      if (err) {
        this.setState({
          error : err
        });
        return;
      }
      this.bookings.store(booking);
    });
  }

  loadCarPath(id) {
    api.get(`/history/booking/${ id }`, (err, model) => {
      var locationHistory = model.data.data;
      this.setState({
        carPath : locationHistory
      });
    });
  }

  /**
   * Sends a booking update action to the api.
   * @param  {String} action cancel|end|complete|close
   * @return {Void}
   */
  update(action, force) {
    this.setState({
      isActing : true
    });
    api.put(`/bookings/${ this.props.params.id }/${ action }${ force ? '?force=true' : '' }`, {}, (err) => {
      this.setState({
        isActing : false
      });
      if (err) {
        // display the force button next to the action button (#964)
        this.setState({
          force: action
        });
        if (action === 'end' || action === 'complete') {
          snackbar.notify({
            type    : 'danger',
            message : err.message,
            action : {
              title : 'FORCE',
              click : () => {
                snackbar.dismiss();
                this.update(action, true);
              }
            }
          });
        }
      }
    });
  }

  extendForFree(reservationTime, force) {
    this.setState({
      isActing : true
    });
    api.put(`/bookings/${ this.props.params.id }/${reservationTime ? reservationTime : 10}/extendForFree${ force ? '?force=true' : '' }`, {}, (err) => {
      this.setState({
        isActing : false
      });
      if (err) {
        // display the force button next to the action button (#964)
        this.setState({
          force: 'extendForFree'
        });
      }
    });
  }



  /**
   * Sends a booking cancel request to the api.
   * @param  {String} action cancel|end|complete|close
   * @return {Void}
   */
  cancel(action) {
    this.setState({
      isActing : true
    });
    api.delete(`/bookings/${ this.props.params.id }`, (err) => {
      this.setState({
        isActing : false
      });
    });
  }

  /**
   * Show popup window with user info.
   * @param  {Event}
   * @return {Void}
   */
  showUserInfo(event) {
    event.preventDefault();
    document.getElementById('userInfoWindow').style.display = 'block';
  }

  /**
   * Close popup window with user info.
   * @param  {Event}
   * @return {Void}
   */
  closeUserInfo(event) {
    event.preventDefault();
    document.getElementById('userInfoWindow').style.display = 'none';
  }

  /**
   * Renders all payments associated with booking
   * @param {Array} payments
   * @param {Object}
   */
  renderPayments(payments) {
    let ids = payments.map(payment => payment.id);

    return (
      <BookingPayment paymentIds={ ids }/>
    );
  }

  handleInputChange(event) {

    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  /**
   * Renders the available actions that can be performed on the booking.
   * @param  {Object} booking
   * @return {Object}
   */
  renderActions(booking) {
    if (this.state.isActing) {
      return <div className="text-center">Performing action...</div>;
    }

    let action = false;
    switch (booking.status) {
      case 'started' : {
        action = ( 
          <div>
            <div>
              <button type="button" onClick={ () => { this.cancel() } } className="btn btn-primary">Cancel</button>
              <button type="button" onClick={ () => { this.update('ready') } } className="btn btn-link">Start Ride</button>
            </div>
            <div>
              <div className="form-group row">
                <button type="button" onClick={ () => { this.update('extend') } } className="btn btn-link">Extend 10 minutes for $1</button>
                <button type="button" onClick={ () => { this.extendForFree(10) } } className="btn btn-link">Extend 10 minutes for $0</button>
              </div>
              <div className="form-group row">
                <div className="col-xs-12">
                  <label>${"Extend " + this.state.reservationTime + " minutes for $0"}</label>
                  <input type="text" className="form-control" name="reservationTime" value={this.state.reservationTime} onChange={this.handleInputChange}/>
                  <button type="button" onClick={ () => { this.extendForFree(this.state.reservationTime) } } className="btn btn-link">Extend</button>
                </div>
              </div>
          </div>
         </div>

        );
        break;
      }
      case 'ready'   : {
        action = <button type="button" onClick={ () => { this.update('ready') } } className="btn btn-primary">Start Ride</button>;
        break;
      }
      case 'started' : {
        let drove = booking.flags.drove;
        let cancelforfeit = booking.flags.cancelforfeit;
        action = (
          <span>
            <button type="button" onClick={ () => { this.update('end') } } className="btn btn-primary">End Ride</button>
            { drove ? '' : (
                cancelforfeit ? <span><br/>Forfeiture Cancelled</span> :
                  <button type="button" onClick={ () => { this.update('cancelforfeit') } } className="btn btn-link">Cancel Forfeiture</button>
              )
            }
          </span>
        )
        break;
      }
      case 'ended' : {
        action = <button type="button" onClick={ () => { this.update('complete') } } className="btn btn-primary">Complete Ride & Lock Car</button>;
        break;
      }
    }

    var force = ""; 
    if (this.state.force) {
      force = <button type="button" onClick={ () => { this.update(this.state.force, true) } } className="btn btn-link">force</button>
    }
    if (action) {
      return (
        <div className="row">
          <div className="col-xs-12 booking-actions text-center">
            { action }
            { force }
          </div>
        </div>
      );
    }
  }

  renderNotes(booking) {
    return (
      <NotesList type='booking' identifier={ booking.id }></NotesList>
    );
  }

  render() {
    if (this.state.error) {
      return (
        <div id="booking-view">
          <div className="booking-message">
            { this.state.error.message }
          </div>
        </div>
      );
    }

    let booking = this.state.bookings.find(val => val.id === parseInt(this.props.params.id));
    if (!booking || !booking.user ) {
      return (
        <div id="booking-view">
          <div className="booking-message">
            Loading ...
          </div>
        </div>
      );
    }
    if(_.isString(booking.flags)) {
      let flags = {};
      JSON.parse(booking.flags).forEach(which => { flags[which] = 1 });
      booking.flags = flags;
    } else if(_.isNull(booking.flags)){
      booking.flags = {};
    }

    let extended = booking.flags.extended ? 'Extended' : 'Not Extended';

    return (
      <div id="booking-view">
        <div className="box">
          <h3>Booking <small>Current booking status</small></h3>
          <div className="box-content">
            <div className="row">
              <div className="col-xs-12 col-md-4 booking-status text-center">
                <strong>Status</strong>
                <div>
                  { helpers.changeCase.toCapital(booking.status) } <br/>
                  <small>{ moment(booking.updatedAt).format('MM/DD HH:mm') }</small>
                </div>
              </div>
              <div className="col-xs-12 col-md-4 booking-status text-center">
                <strong>Customer</strong>
                <div>
                  <Link to={ `/users/${ booking.user.id }` }>
                    { booking.user.firstName } { booking.user.lastName }
                  </Link>
                  <small><button className='btn-link' onClick={this.showUserInfo}>Show License</button></small>
                </div>
              </div>
              <div className="col-xs-12 col-md-4 booking-status text-center">
                <strong>Car</strong>
                <div>
                  { booking.car ? 
                    <Link to={ `/cars/${ booking.car.id }` }>
                      { booking.car.license || booking.car.id }
                    </Link>
                    :
                    "(unknown car)"
                  }
                <small>{ extended }</small>
                </div>
              </div>
            </div>
            { this.renderActions(booking) }
          </div>
        </div>
        <div className="box" id="userInfoWindow">
          <div className="box-content">
             <UserLicense id={ booking.user.id } readOnly="1" />
          </div>
        </div>
        {
          [ 'ended', 'completed', 'closed' ].indexOf(booking.status) !== -1
            ? <BookingDetails booking={ booking } carPath = {this.state.carPath }/>
            : <div className="box-empty">
                <h3>Details</h3>
                A ride must be ended before details are shown.
              </div>
        }
        {
          booking.payments.length
            ? this.renderPayments(booking.payments)
            : ''
        }
        {
          booking.status === 'completed'
            ? <BookingFees bookingId={ booking.id } userId={ booking.userId } cartId={ booking.cartId } />
            : ''
        }
        { this.renderNotes(booking) }
      </div>
    );
  }

};
