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
      isActing : false
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
    api.get(`/bookings/${ this.props.params.id }`, (err, booking) => {
      if (err) {
        return console.log(err);
      }
      this.bookings.store(booking);
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
      if (err) {
        console.log(err);
      }
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
   * Renders booking view.
   * @return {Object}
   */
  render() {
    let booking = this.state.bookings.find(val => val.id === parseInt(this.props.params.id));
    if (!booking) {
      return <div>Loading booking...</div>;
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

        <pre>
          { JSON.stringify(booking, null, 2) }
        </pre>
      </div>
    );
  }

};
