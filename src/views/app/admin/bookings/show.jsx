import React                   from 'react';
import { api, relay, helpers } from 'bento';
import { Link }                from 'react-router';
import BookingFees             from './fees';
import BookingPayment          from './payment';
import BookingDetails          from './details';
import { snackbar }         from 'bento-web';
import NotesList from '../components/notes/list';

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
      error    : null,
      items    : []
    };
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
      case 'reserved' : {
        action = ( 
          <span> 
            <button type="button" onClick={ () => { this.cancel() } } className="btn btn-primary">Cancel</button> 
            <button type="button" onClick={ () => { this.update('ready') } } className="btn btn-link">Start Ride</button> 
          </span> 
        );
        break;
      }
      case 'ready'   : {
        action = <button type="button" onClick={ () => { this.update('ready') } } className="btn btn-primary">Start Ride</button>;
        break;
      }
      case 'started' : {
        action = <button type="button" onClick={ () => { this.update('end') } } className="btn btn-primary">End Ride</button>;
        break;
      }
      case 'ended' : {
        action = <button type="button" onClick={ () => { this.update('complete') } } className="btn btn-primary">Complete Ride & Lock Car</button>;
        break;
      }
    }

    if (action) {
      return (
        <div className="row">
          <div className="col-xs-12 booking-actions text-center">
            { action }
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

  /**
   * Renders booking view.
   * @return {Object}
   */
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
    if (!booking || !booking.user) {
      return (
        <div id="booking-view">
          <div className="booking-message">
            Loading ...
          </div>
        </div>
      );
    }

    return (
      <div id="booking-view">
        <div className="box">
          <h3>Booking <small>Current booking status</small></h3>
          <div className="box-content">
            <div className="row">
              <div className="col-xs-12 col-md-4 booking-status text-center">
                <strong>Status</strong>
                <div>
                  { helpers.changeCase.toCapital(booking.status) }
                </div>
              </div>
              <div className="col-xs-12 col-md-4 booking-status text-center">
                <strong>Customer</strong>
                <div>
                  <Link to={ `/users/${ booking.user.id }` }>
                    { booking.user.firstName } { booking.user.lastName }
                  </Link>
                </div>
              </div>
              <div className="col-xs-12 col-md-4 booking-status text-center">
                <strong>Car</strong>
                <div>
                  <Link to={ `/cars/${ booking.car.id }` }>
                    { booking.car.license || booking.car.id }
                  </Link>
                </div>
              </div>
            </div>
            { this.renderActions(booking) }
          </div>
        </div>
        {
          [ 'ended', 'completed', 'closed' ].indexOf(booking.status) !== -1
            ? <BookingDetails booking={ booking } />
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
