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
                onClick={() =>
                  this.setState({
                    timeFrameSelected: 'allTime',
                    currentBookings: stats.allTime.bookings,
                    currentOrders: stats.allTime.orders,
                  })
                }>
                All Time
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() =>
                  this.setState({
                    timeFrameSelected: 'day',
                    currentBookings: stats.day.bookings,
                    currentOrders: stats.day.orders,
                  })
                }>
                24 Hours
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() =>
                  this.setState({
                    timeFrameSelected: 'week',
                    currentBookings: stats.week.bookings,
                    currentOrders: stats.week.orders,
                  })
                }>
                7 Days
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() =>
                  this.setState({
                    timeFrameSelected: 'month',
                    currentBookings: stats.month.bookings,
                    currentOrders: stats.month.orders,
                  })
                }>
                30 Days
              </button>
              <div>
                <h4>Stats for selected period</h4>
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
                  Average Length Of Rides:
                  {currentBookings.reduce((acc, booking) => {
                    console.log(booking.details);
                    console.log(
                      moment.duration(
                        moment(booking.details[1].createdAt).diff(
                          moment(booking.details[0].createdAt),
                        ),
                      ),
                    );
                    return (
                      acc +
                      moment
                        .duration(
                          moment(booking.details[1].createdAt).diff(
                            moment(booking.details[0].createdAt),
                          ),
                        )
                        .asMilliseconds()
                    );
                  }, 0) / currentBookings.length}
                  {/*The next part to do will be getting average distance of bookings All of this logic should be moved to the api*/}
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
