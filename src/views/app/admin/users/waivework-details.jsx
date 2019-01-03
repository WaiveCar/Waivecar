import React, {Component} from 'react';
import {Link} from 'react-router';
import {api} from 'bento';
import moment from 'moment';

class WaiveWorkDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentWaiveWorkBooking: null,
      allTime: 0,
      lastMonth: 0,
      lastWeek: 0,
      yesterday: 0,
      carSearch: '',
      searchResults: [],
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
          this.setState({currentWaiveWorkBooking: bookings[0]}, () => {
            api.get(
              `/cars/${bookings[0].car.id}/history?start=${
                bookings[0].createdAt
              }`,
              (err, history) => {
                if (err) {
                  return console.log(err);
                }
                console.log('car history: ', history);
              },
            );
          });
        }
      },
    );
  }

  carSearch() {
    api.get(`/cars/search/?search=${this.state.carSearch}`, (err, response) => {
      if (err) {
        return console.log('error searching for cars', err.message);
      }
      this.setState({searchResults: response}, () =>
        console.log('results: ', this.state.searchResults),
      );
    });
  }

  render() {
    let {
      currentWaiveWorkBooking,
      allTime,
      lastMonth,
      lastWeek,
      yesterday,
      searchResults,
    } = this.state;
    //console.log('booking: ', currentWaiveWorkBooking);
    // TODO: Add conversion from km to miles
    return (
      <div className="box">
        <h3>
          WaiveWork Billing
          <small>Setup User's WaiveWork Billing</small>
        </h3>
        <div className="box-content">
          {this.state.currentWaiveWorkBooking ? (
            <div>
              Current WaiveWork Booking:{' '}
              <Link to={`/bookings/${currentWaiveWorkBooking.id}`}>
                {currentWaiveWorkBooking.id}
              </Link>{' '}
              in{' '}
              <Link to={`/cars/${currentWaiveWorkBooking.car.id}`}>
                {currentWaiveWorkBooking.car.license}
              </Link>
              <div>
                Start Date:{' '}
                {moment(currentWaiveWorkBooking.createdAt).format('MM/DD/YYYY')}
              </div>
              <div>Next Billing Date:</div>
              <div>
                Total Miles Driven:{' '}
                {(
                  currentWaiveWorkBooking.car.totalMileage -
                  currentWaiveWorkBooking.details[0].mileage
                ).toFixed(2)}
              </div>
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
                Price Per Week: <input type="number" />
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
            <div>
              Not currently booked into a WaiveWork vehicle
              <div className="row" style={{marginTop: '4px'}}>
                <input
                  onChange={e => this.setState({carSearch: e.target.value})}
                  value={this.state.carSearch}
                  style={{marginTop: '1px', padding: '2px', height: '40px'}}
                  className="col-xs-6"
                  placeholder="Car Number"
                />
                <button
                  className="btn btn-primary btn-sm col-xs-6"
                  onClick={() => this.carSearch()}>
                  Find Car
                </button>
              </div>
              {searchResults &&
                searchResults.map((item, i) => {
                  return (
                    <div key={i} className="row">
                      <div style={{padding: '10px 0'}} className="col-xs-6">
                        {item.license}
                      </div>
                      <button
                        className="btn btn-link col-xs-6"
                        onClick={() => console.log('cliiiiiickkk')}>
                        Book Now
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default WaiveWorkDetails;
