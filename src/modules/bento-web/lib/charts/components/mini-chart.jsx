import React                                          from 'react';
import Math                                           from '../lib/math';
import { Sparklines, SparklinesBars, SparklinesLine } from 'react-sparklines';

module.exports = class MiniChart extends React.Component {

  renderLine() {
    switch (this.props.type) {
      case 'bar' : return (<SparklinesBars style={{ fill : '#ffffff' }} />);
      default    : return (<SparklinesLine color="#ffffff" />);
    }
  }

  render() {
    let data = [];
    let count = 0;
    let chartContainerClass = 'mini-chart-container ' + this.props.className;

    if (this.props.data) {
      data  = Math.groupByDay(this.props.data);
      count = this.props.data.length;
    }

    return (
      <div className={ chartContainerClass }>
        <div className="chart">
          <Sparklines data={ data } width={ 83 } height={ 45 }>
            { this.renderLine() }
          </Sparklines>
        </div>
        <div className="count">
          <small>{ this.props.title }</small>
          <h2>{ count }</h2>
        </div>
      </div>
    );
  }
}