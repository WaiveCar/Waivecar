'use strict';

import React from 'react';

export default class Card extends React.Component {
  render() {
    let { title, image, stats } = this.props.ride;
    return (
      <div className="ride-card">
        My Ride
      </div>
    );
  }
}