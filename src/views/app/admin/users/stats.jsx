import React, {Component} from 'react';
import {api} from 'bento';
import moment from 'moment';

class Stats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: null,
      timeFrameSelected: 'allTime',
      currentBookings: [],
      currentOrders: [],
    };
  }

  componentDidMount() {
    api.get(`/users/${this.props.id}/stats`, (err, stats) => {
      this.setState({
        stats,
        currentBookings: stats.allTime.bookings,
        currentOrders: stats.allTime.orders,
      });
    });
  }

  render() {
    let mthis = this;
    let {stats, timeFrameSelected, currentBookings, currentOrders} = this.state;
    return (
      <div>
        {stats && (
          <div className="box">
            <h3>
              Statistics
              <small>on this user's usage</small>
            </h3>
            <div className="box-content">
              { [ 
                  ['allTime', 'All Time'],
                  ['day', '24 hours'],
                  ['week', '7 days'],
                  ['month', '30 days']
                ].map((row) => {
                  return <button
                    style={{marginRight: "0.5rem"}}
                    className={ "btn btn-sm " + (mthis.state.timeFrameSelected === row[0] ? 'btn-primary' : '') }
                    onClick={() =>
                      mthis.setState({
                        timeFrameSelected: row[0],
                        currentBookings: stats[row[0]].bookings,
                        currentOrders: stats[row[0]].orders,
                      })
                    }>
                    { row[1] }
                  </button>
                })
              }
              <div style={{marginTop: '10px'}}>
                <label
                  className="form-control-label"
                  style={{color: '#666', fontWeight: 300}}>
                  Total Rides: {currentBookings.length}
                </label>
                <label
                  className="form-control-label"
                  style={{color: '#666', fontWeight: 300}}>
                  Total Spent: ${(
                    currentOrders.reduce(
                      (acc, order) => acc + order.amount,
                      0,
                    ) / 100
                  ).toFixed(2)}
                </label>
                <label
                  className="form-control-label"
                  style={{color: '#666', fontWeight: 300}}>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Stats;
