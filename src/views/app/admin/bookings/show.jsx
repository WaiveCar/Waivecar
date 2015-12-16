import React from 'react';
import {
  api,
  relay,
  helpers
} from 'bento';

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
      error    : null
    };
    relay.subscribe(this, [ 'bookings', 'carts' ]);
  }

  /**
   * Unsubscribe from the bookings relay.
   * @return {Void}
   */
  componentWillUnmount() {
    relay.unsubscribe(this, [ 'bookings', 'carts' ]);
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
      if (booking.cart) {
        this.loadCart(booking.cart.id);
      }
    });
  }

  /**
   * Loads booking.
   * @param  {String} id
   * @return {Void}
   */
  loadCart(id) {
    api.get(`/shop/carts/${ id }`, (err, cart) => {
      if (err) {
        this.setState({
          error : err
        });
        return;
      }
      relay.dispatch('carts', {
        type : 'store',
        data : cart
      });
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
   * Renders the available actions that can be performed on the booking.
   * @param  {Object} booking
   * @return {Object}
   */
  renderActions(booking) {
    if (this.state.isActing) {
      return <div className="text-center">Performing action...</div>;
    }
    switch (booking.status) {
      case 'reserved' : return <button type="button" onClick={ () => { this.update('cancel') } } className="btn btn-primary">Cancel</button>;
      case 'ready'    : // started ...
      case 'started'  : return <button type="button" onClick={ () => { this.update('end') } } className="btn btn-primary">End Ride</button>;
      case 'ended'    : return <button type="button" onClick={ () => { this.update('complete') } } className="btn btn-primary">Complete Ride & Lock Car</button>;
    }
  }

  /**
   * Returns a list of fees attached to the booking.
   * @param  {Object} booking
   * @return {Object}
   */
  renderFees(booking) {
    if (!booking.cart) {
      return;
    }
    let cart = this.state.carts.find(val => val.id === booking.cart.id);
    if (cart) {
      return (
        <div className="box">
          <h3>Fees <small>List of fees to charge the booking</small></h3>
          <div className="box-content">
            <table className="fee-list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
              {
                cart.items.map((item) => {
                  return (
                    <tr key={ item.id }>
                      <td>{ item.name }</td>
                      <td>${ item.price / 100 }</td>
                      <td>{ item.quantity }</td>
                      <td>${ item.total / 100 }</td>
                    </tr>
                  )
                })
              }
              </tbody>
            </table>
          </div>
        </div>
      );
    }
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
              <div className="col-md-4 booking-status text-center">
                <strong>Status</strong>
                <div>
                  { helpers.changeCase.toCapital(booking.status) }
                </div>
              </div>
              <div className="col-md-4 booking-status text-center">
                <strong>Customer</strong>
                <div>
                  { booking.user.firstName } { booking.user.lastName }
                </div>
              </div>
              <div className="col-md-4 booking-status text-center">
                <strong>Car</strong>
                <div>
                  { booking.car.license }
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-xs-12 booking-actions text-center">
                { this.renderActions(booking) }
              </div>
            </div>
          </div>
        </div>

        { this.renderFees(booking) }

        <pre>
          { JSON.stringify(booking, null, 2) }
        </pre>
      </div>
    );
  }

};
