import React, {Component} from 'react';
import {api} from 'bento';

class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: null,
      timeFrameSelected: 'allTime',
    };
  }

  componentDidMount() {
    api.get(`/users/${this.props.id}/stats`, (err, stats) => {
      this.setState({stats});
    });
  }

  render = () => {
    let {stats} = this.state;
    return (
      <div>
        {stats && (
          <div className="box">
            <h3>
              Statistics
              <small>on this user's usage</small>
            </h3>
            <div className="box-content">
              <div>
                <label
                  className="form-control-label"
                  style={{color: '#666', fontWeight: 300}}>
                  Total Rides: {stats.totalBookings}
                </label>
                <label
                  className="form-control-label"
                  style={{color: '#666', fontWeight: 300}}>
                  Total Spent: ${stats.totalSpent}
                </label>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => this.setState({timeFrameSelected: 'day'})}>
                24 Hours
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => this.setState({timeFrameSelected: 'week'})}>
                7 Days
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => this.setState({timeFrameSelected: 'month'})}>
                30 Days
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => this.setState({timeFrameSelected: 'allTime'})}>
                All Time
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
}

export default Stats;
