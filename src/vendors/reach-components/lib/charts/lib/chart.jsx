'use strict';

import React from 'react';
import { Sparklines, SparklinesBars, SparklinesLine } from 'react-sparklines';
import './style.scss';

export default class Chart extends React.Component {
  render() {
    let chartContainerClass = 'chart-container ' + this.props.className;
    let chartClass          = 'chart';
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

    let lineRender = this.props.chartType === 'bar' ? <SparklinesBars style={ barStyle } /> : <SparklinesLine style={ lineStyle } />;

    let width = this.props.width > 0 ? this.props.width - 28 : 0; // we know there is 15px padding, and we want 1px less. (x2)

    return (
      <section className="card card-body-chart">
        <div className="card-header">
          <h2>{ this.props.title }</h2>
        </div>
        <div className="card-body">
          <div className={ chartContainerClass }>
            <div className={ chartClass }>
              <Sparklines data={ this.props.data } width={ width } height={ 152 } key={ width }>
                { lineRender }
              </Sparklines>
            </div>
          </div>
        </div>
      </section>
    );
  }
}