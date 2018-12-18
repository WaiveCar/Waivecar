import React, {Component} from 'react';
import {api} from 'bento';

class WaiveWorkDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentWaiveWorkBooking: null,
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
    return (
      <div className="box">
        <h3>
          WaiveWork Billing
          <small>Setup User's WaiveWork Billing</small>
        </h3>
        <div className="box-content">
          {this.state.currentWaiveWorkBooking ? (
            <div>
              Currently In WaiveWork
            </div>
          ) : (
            <div>
              Not currently in WaiveWork
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default WaiveWorkDetails;
