'use strict';

import React                                          from 'react';
import Math                                           from '../lib/math';
import { Sparklines, SparklinesBars, SparklinesLine } from 'react-sparklines';
import './style.scss';

export default class Chart extends React.Component {

  renderLine() {
    let barStyle = {
      fill : '#ffffff'
    };

    let lineStyle = {
      stroke         : '#F0DD2F',
      strokeWidth    : 1,
      strokeLinejoin : 'round',
      fillOpacity    : 1,
      fill           : '#F0DD2F'
    };

    switch (this.props.type) {
      case 'bar' : return (<SparklinesBars style={ barStyle } />);
      default    : return (<SparklinesLine style={ lineStyle } />);
    }
  }

  render() {
    let data  = [];
    let count = 0;
    let width = this.props.width > 0 ? this.props.width - 28 : 0; // we know there is 15px padding, and we want 1px less. (x2)

    if (this.props.data) {
      data  = Math.groupByDay(this.props.data);
      count = this.props.data.length;
    }

    return (
      <section className="card card-body-chart">
        <div className="card-header">
          <h2>{ this.props.title }</h2>
          <span className="card-counter">{ count }</span>
        </div>
        <div className="card-body">
          <div className="chart-container">
            <div className="chart">
              <Sparklines data={ data } width={ width } height={ 152 } key={ width }>
                { this.renderLine() }
              </Sparklines>
            </div>
          </div>
        </div>
      </section>
    );
  }
}