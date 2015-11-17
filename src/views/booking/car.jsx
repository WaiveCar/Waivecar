'use strict';

import React               from 'react';
import { relay, api, dom } from 'bento';
import { components }      from 'bento-ui';

let Map = components.get('map');

module.exports = class BookingCar extends React.Component {

  /**
   * Subscribes to booking state.
   * @param  {...Mixed} args
   */
  constructor(...args) {
    super(...args);
    dom.setTitle('Book a Car');
    this.state = {
      car : null
    };
    relay.subscribe(this, 'booking');
    this.close = this.close.bind(this);
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
    return components.render('map', {
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
                  <td className="value">{ car.fuel }%</td>
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
   * Close car popup.
   */
  close() {
    this.setState({
      car : null
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
