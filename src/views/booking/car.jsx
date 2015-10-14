'use strict';

import React     from 'react';
import { relay } from 'reach-react';

export default class BookingCar extends React.Component {

  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'booking');
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'booking');
  }

  render() {
    return (
      <div className="booking-car">
        Car Map
      </div>
    );
  }

}