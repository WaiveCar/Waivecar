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

    switch (this.props.chartType) {
      case 'bar' : return (<SparklinesBars style={ barStyle } />);
      default    : return (<SparklinesLine style={ lineStyle } />);
    }
  }

  render() {
    let data  = [];
    let width = this.props.width > 0 ? this.props.width - 28 : 0; // we know there is 15px padding, and we want 1px less. (x2)

    if (this.props.data) {
      let days = Math.groupByDay(this.props.data);
      data = Object.keys(days).map(function (key) { return days[key] });
    }

    return (
      <section className="card card-body-chart">
        <div className="card-header">
          <h2>{ this.props.title }</h2>
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