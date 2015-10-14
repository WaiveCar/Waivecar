'use strict';

import React          from 'react';
import UI             from 'reach-ui';
import { relay, api } from 'reach-react';

let Map = UI.components.get('map');

export default class BookingCar extends React.Component {

  /**
   * Subscribes to booking state.
   * @param  {...Mixed} args
   */
  constructor(...args) {
    super(...args);
    this.state = {
      car : null
    };
    relay.subscribe(this, 'booking');
    this.close = this.close.bind(this);
    this.next  = this.next.bind(this);
  }

  /**
   * Unsubscribes from the booking state.
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'booking');
  }

  /**
   * Returns a redenrable UIMap component.
   * @return {Object}
   */
  map() {
    return UI.components.render('map', {
      resource : 'cars',
      handler  : (data) => {
        this.showCar(data.id);
      }.bind(this)
    });
  }

  /**
   * Shows the selected car in a modal.
   * @param  {String} id
   */
  showCar(id) {
    api.get(`/cars/${ id }`, (error, data) => {
      if (error) {
        return console.log(error);
      }
      this.setState({
        car : data
      });
    }.bind(this));
  }

  /**
   * Returns car information popup.
   * @return {Object}
   */
  renderCar() {
    let { car } = this.state;
    if (!car) {
      return false;
    }

    let battery = this.diagnostic('evBatteryLevel');

    return (
      <div>
        <div className="overlay" onClick={ this.close } />
        <div className="booking-car">
          <h4>WaiveCar <small>{ car.make } { car.year }</small></h4>
          <div className="car-img" style={{ backgroundImage : `url('/images/cars/${ car.make }.png')` }}></div>
          <div className="car-status">
            <table>
              <tbody>
                <tr>
                  <td className="icon"><i className="material-icons">battery_charging_full</i></td>
                  <td>Battery Level</td>
                  <td className="value">{ battery.value }{ battery.unit }</td>
                </tr>
              </tbody>
            </table>
            <button className="btn btn-success" onClick={ this.next }>Book</button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Returns diagnostics object.
   * @param  {String} type
   * @return {Object}
   */
  diagnostic(type) {
    let { diagnostics } = this.state.car;
    for (let i = 0, len = diagnostics.length; i < len; i++) {
      if (diagnostics[i].type === type) {
        return diagnostics[i];
      }
    }
  }

  /**
   * Close car popup.
   */
  close() {
    this.setState({
      car : null
    });
  }

  /**
   * Go to the next stage of booking.
   */
  next() {
    this.booking.update({
      car : this.state.car
    });
  }

  /**
   * Renders the booking map.
   * @return {Object}
   */
  render() {
    return (
      <div className="booking-wrapper">
        { this.map() }
        { this.renderCar() }
      </div>
    );
  }

}