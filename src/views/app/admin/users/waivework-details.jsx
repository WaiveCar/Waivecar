import React, {Component} from 'react';
import {api} from 'bento';

class WaiveWorkDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentWaiveWorkBooking: null,
      allTime: 0,
      lastMonth: 0,
      lastWeek: 0,
      yesterday: 0,
    };
  }

  componentDidMount() {
    api.get(
      '/bookings',
      {
        userId: this.props.user.id,
        order: 'id,DESC',
        details: true,
        status: 'started,reserved',
        limit: 1,
      },
      (err, bookings) => {
        if (err) {
          return console.log(err);
        }
        if (bookings[0] && bookings[0].car.license.match(/work/gi)) {
          this.setState({currentWaiveWorkBooking: bookings[0]});
        }
      },
    );
  }

  render() {
    let {
      currentWaiveWorkBooking,
      allTime,
      lastMonth,
      lastWeek,
      yesterday,
    } = this.state;
    return (
      <div className="box">
        <h3>
          WaiveWork Billing
          <small>Setup User's WaiveWork Billing</small>
        </h3>
        <div className="box-content">
          {this.state.currentWaiveWorkBooking ? (
            <div>
              Current WaiveWork Booking
              <div>Start Date:</div>
              <div>Next Billing Date:</div>
              <div>Total Miles Driven:</div>
              <div style={{textAlign: 'center'}}>
                Average Miles Per Day:
                <table style={{width: '100%'}}>
                  <tbody>
                    <tr>
                      <th>All Time</th>
                      <th>Last Month</th>
                      <th>Last Week</th>
                      <th>Yesterday</th>
                    </tr>
                    <tr>
                      <td>{allTime}</td>
                      <td>{lastMonth}</td>
                      <td>{lastWeek}</td>
                      <td>{yesterday}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                Price Per Week:
              </div>
              <div className="text-center">
                <div className="btn-group" role="group">
                  <button type="button" className="btn btn-primary">
                    Update
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>Not currently into a WaiveWork vehicle</div>
          )}
        </div>
      </div>
    );
  }
}

export default WaiveWorkDetails;
