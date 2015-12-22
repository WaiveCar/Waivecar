import React                   from 'react';
import { api, relay, helpers } from 'bento';
import BookingFees             from './fees';

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
      cartId   : null,
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
      if (booking.cartId) {
        this.setState({ cartId : booking.cartId });
      }
    });
  }

  /**
   * Sends a booking update action to the api.
   * @param  {String} action cancel|end|complete|close
   * @return {Void}
   */
  update(action) {
    this.setState({
      isActing : true
    });
    api.put(`/bookings/${ this.props.params.id }/${ action }`, {}, (err) => {
      this.setState({
        isActing : false
      });
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
        action = <button type="button" onClick={ () => { this.cancel() } } className="btn btn-primary">Cancel</button>;
        break;
      }
      case 'ready'   :
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

  /**
   * Returns a list of fees attached to the booking.
   * @return {Object}
   */
  renderFees() {
    if (!this.state.cartId) {
      return;
    }
    return <BookingFees cartId={ this.state.cartId } />
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
                  { booking.user.firstName } { booking.user.lastName }
                </div>
              </div>
              <div className="col-xs-12 col-md-4 booking-status text-center">
                <strong>Car</strong>
                <div>
                  { booking.car.license }
                </div>
              </div>
            </div>
            { this.renderActions(booking) }
          </div>
        </div>

        { this.renderFees() }

        <pre>
          { JSON.stringify(booking, null, 2) }
        </pre>
      </div>
    );
  }

};
