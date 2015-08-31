'use strict';

import React from 'react';
import { Sparklines, SparklinesBars, SparklinesLine } from 'react-sparklines';
import './style.scss';

export default class MiniChart extends React.Component {
  render() {
    let chartContainerClass = 'mini-chart-container ' + this.props.className;
    let chartClass          = 'chart';

    let lineRender = this.props.chartType === 'bar' ? <SparklinesBars style={{ fill : '#ffffff' }} /> : <SparklinesLine color="#ffffff" />;

    return (
      <div className={ chartContainerClass }>
        <div className={ chartClass }>
          <Sparklines data={ this.props.data } width={ 83 } height={ 45 }>
            { lineRender }
          </Sparklines>
        </div>
        <div className="count">
          <small>{ this.props.title}</small>
          <h2>{ this.props.count }</h2>
        </div>
      </div>
    );
  }
}