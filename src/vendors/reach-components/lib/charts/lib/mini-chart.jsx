'use strict';

import React from 'react';
import './style.scss';

export default class LineChart extends React.Component {
  render() {
    return (
      <div className='mini-chart brand-primary'>
        <div className="chart"></div>
        <div className="count">
          <small>Total Signups</small>
          <h2>1234</h2>
        </div>
      </div>
    );
  }
}