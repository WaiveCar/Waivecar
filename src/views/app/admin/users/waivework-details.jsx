import React, {Component} from 'react';
import {Link} from 'react-router';
import {api} from 'bento';
import {snackbar} from 'bento-web';
import moment from 'moment';
import Service from '../../lib/car-service';

class WaiveWorkDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentWaiveworkBooking: null,
      carSearchWord: '',
      searchResults: [],
      carHistory: [],
      perWeek: null,
      startDate: null,
      proratedChargeAmount: null,
      ended: false,
    };
  }

  componentDidMount() {
    api.get(
      '/bookings',
      {
        userId: this.props.user.id,
        order: 'id,DESC',
        details: true,
        status: 'started,reserved,ended',
        limit: 1,
        includeWaiveworkPayment: true,
      },
      (err, bookings) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        if (bookings[0]) {
          this.setState(
            {
              perWeek:
                bookings[0].waiveworkPayment &&
                (bookings[0].waiveworkPayment.amount / 100).toFixed(2),
              currentWaiveworkBooking: bookings[0],
            },
            () => {
              api.get(
                `/cars/${bookings[0].car.id}/history?start=${
                  bookings[0].createdAt
                }`,
                (err, history) => {
                  if (err) {
                    return snackbar.notify({
                      type: 'danger',
                      message: err.message,
                    });
                  }
                  this.setState({carHistory: history}, () =>
                    console.log('state: ', this.state),
                  );
                },
              );
            },
          );
        }
      },
    );
  }

  getProratedCharge() {
    let {perWeek, startDate} = this.state;
    api.get(
      `/waiveworkPayment/calculateProratedCharge?amount=${perWeek}&startDate=${startDate}`,
      (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        this.setState({proratedChargeAmount: response.proratedChargeAmount});
      },
    );
  }

  sendEmail() {
    let {user} = this.props;
    let {perWeek} = this.state;
    let opts = {
      user,
      perWeek,
    };
    if (perWeek) {
      api.post('/waitlist/waiveWorkEmail', opts, (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        snackbar.notify({
          type: 'success',
          message: 'Email successfully sent',
        });
      });
    } else {
      return snackbar.notify({
        type: 'danger',
        message: 'Please enter a daily amount.',
      });
    }
  }

  carSearch() {
    api.get(
      `/cars/search/?search=${this.state.carSearchWord}`,
      (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        this.setState({searchResults: response});
      },
    );
  }

  book(carId) {
    let data = {
      source: 'web',
      userId: this.props.user.id,
      carId,
      isWaivework: true,
      amount: this.state.perWeek * 100,
    };
    if (!data.amount) {
      return snackbar.notify({
        type: 'danger',
        message: 'Please enter a weekly amount',
      });
    }
    api.post('/bookings', data, (err, booking) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: err.message,
        });
      }
      this.setState({currentWaiveworkBooking: booking});
    });
  }

  updatePayment() {
    let {currentWaiveworkBooking, perWeek} = this.state;
    api.put(
      `/waiveworkPayment/${currentWaiveworkBooking.id}`,
      {amount: perWeek * 100},
      (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: `Error updating payment: ${err.message}`,
          });
        }
        return snackbar.notify({
          type: 'success',
          message: 'Waivework payment amount updated',
        });
      },
    );
  }

  failedChargeEmail() {
    let {currentWaiveworkBooking, perWeek} = this.state;
    api.post(
      `/waiveworkPayment/${currentWaiveworkBooking.id}/failedPayment`,
      {amount: perWeek * 100, userId: this.props.user.id},
      (err, result) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        return snackbar.notify({
          type: 'success',
          message: 'Failed charge email sent.',
        });
      },
    );
  }

  bookingAction(action) {
    let {currentWaiveworkBooking} = this.state;
    if (
      confirm(
        'Are you sure you want to end this waivework booking? Automatic Billing will be stopped.',
      )
    ) {
      api.put(
        `/bookings/${currentWaiveworkBooking.id}/${action}`,
        {},
        (err, response) => {
          if (err) {
            return snackbar.notify({
              type: 'danger',
              message: `Error completing action: ${err.message}`,
            });
          }
          if (response.isCarReachable) {
            this.setState({ended: true});
          }
          if (response.status === 'success') {
            this.setState(
              {
                currentWaiveworkBooking: null,
                ended: false,
                perWeek: null,
              },
              () => window.location.reload(),
            );
          }
        },
      );
    }
  }

  advanceWorkPayment() {
    if (confirm('Are you sure you want to make this payment early?')) {
      let {currentWaiveworkBooking} = this.state;
      api.get(
        `/waiveworkPayment/advanceWorkPayment/${currentWaiveworkBooking.id}/`,
        (err, response) => {
          if (err) {
            return snackbar.notify({
              type: 'danger',
              message: `Error paying early: ${err.message}`,
            });
          }
          console.log('state: ', this.state);
          console.log('response: ', response);
          this.setState({
            currentWaiveworkBooking: {
              ...this.state.currentWaiveworkBooking,
              waiveworkPayment: response,
            },
          });
        },
      );
    }
  }

  render() {
    let {
      currentWaiveworkBooking,
      searchResults,
      perWeek,
      carHistory,
      carSearchWord,
      ended,
      startDate,
      proratedChargeAmount,
    } = this.state;
    return (
      <div className="box">
        <h3>
          WaiveWork Billing
          <small>Setup User's WaiveWork Billing</small>
        </h3>
        <div className="box-content">
          {currentWaiveworkBooking ? (
            <div>
              Current WaiveWork Booking:{' '}
              <Link to={`/bookings/${currentWaiveworkBooking.id}`}>
                {currentWaiveworkBooking.id}
              </Link>{' '}
              in{' '}
              <Link to={`/cars/${currentWaiveworkBooking.car.id}`}>
                {currentWaiveworkBooking.car.license}
              </Link>
              <div>
                Start Date:{' '}
                {moment(currentWaiveworkBooking.createdAt).format('MM/DD/YYYY')}
              </div>
              <div>
                Next Payment Date:{' '}
                {moment
                  .utc(currentWaiveworkBooking.waiveworkPayment.date)
                  .format('MM/DD/YYYY')}
              </div>
              {carHistory.length && (
                <div>
                  Total Miles Driven:{' '}
                  {(
                    (Number(carHistory[carHistory.length - 1].data) -
                      Number(carHistory[0].data)) *
                    0.621371
                  ).toFixed(2)}
                </div>
              )}
              {carHistory.length && (
                <div style={{textAlign: 'center'}}>
                  Average Miles Per Day:
                  <table style={{width: '100%'}}>
                    <tbody>
                      <tr>
                        <th>All Time</th>
                        <th>Last 30 Days</th>
                        <th>Last Week</th>
                        <th>Yesterday</th>
                      </tr>
                      <tr>
                        <td>
                          {carHistory.length
                            ? (
                                (Number(
                                  carHistory[carHistory.length - 1].data,
                                ) -
                                  Number(carHistory[0].data)) /
                                carHistory.length *
                                0.621371
                              ).toFixed(2)
                            : 'Ride not yet over 1 day'}
                        </td>
                        <td>
                          {carHistory[carHistory.length - 31]
                            ? (
                                (Number(
                                  carHistory[carHistory.length - 1].data,
                                ) -
                                  Number(
                                    carHistory[carHistory.length - 31].data,
                                  )) /
                                30 *
                                0.621371
                              ).toFixed(2)
                            : 'Ride not yet over 30 days'}
                        </td>
                        <td>
                          {carHistory[carHistory.length - 8]
                            ? (
                                (Number(
                                  carHistory[carHistory.length - 1].data,
                                ) -
                                  Number(
                                    carHistory[carHistory.length - 8].data,
                                  )) /
                                7 *
                                0.621371
                              ).toFixed(2)
                            : 'Ride not yet over 1 week'}
                        </td>
                        <td>
                          {carHistory.length > 1
                            ? (
                                (Number(
                                  carHistory[carHistory.length - 1].data,
                                ) -
                                  Number(
                                    carHistory[carHistory.length - 2].data,
                                  )) *
                                0.621371
                              ).toFixed(2)
                            : 'Ride not yet over 1 day'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {currentWaiveworkBooking.waiveworkPayment ||
              currentWaiveworkBooking.status === 'ended' ? (
                <div>
                  <div>
                    Price Per Week:{' '}
                    <input
                      type="number"
                      value={perWeek}
                      onChange={e => this.setState({perWeek: e.target.value})}
                    />
                  </div>
                  <div className="text-center" style={{marginTop: '1em'}}>
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => this.updatePayment()}>
                        Update Price
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                          this.bookingAction(ended ? 'complete' : 'end')
                        }>
                        {ended ? 'Complete' : 'End'} Booking
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => this.advanceWorkPayment()}>
                        Pay early
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => this.failedChargeEmail()}>
                        Failed Charge Email
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  Automatic payment not yet setup for this WaiveWork Booking
                </div>
              )}
            </div>
          ) : (
            <div>
              <h4>Not currently booked into WaiveWork</h4>
              <div className="row" style={{marginTop: '4px'}}>
                <input
                  className="col-xs-6"
                  style={{marginTop: '1px', padding: '2px', height: '40px'}}
                  type="number"
                  placeholder="Amount Per Week"
                  value={perWeek}
                  onChange={e => this.setState({perWeek: e.target.value})}
                />
                <button
                  className="btn btn-primary btn-sm col-xs-6"
                  onClick={() => this.sendEmail()}>
                  Send Quote
                </button>
              </div>
              <div className="row" style={{marginTop: '4px'}}>
                <input
                  className="col-xs-6"
                  style={{marginTop: '1px', padding: '2px', height: '40px'}}
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={e => this.setState({startDate: e.target.value})}
                />
                <button
                  className="btn btn-primary btn-sm col-xs-6"
                  onClick={() => this.getProratedCharge()}>
                  Get prorated amount
                </button>
              </div>
              {proratedChargeAmount && (
                <div>Charge amount: ${proratedChargeAmount}</div>
              )}
              <div className="row" style={{marginTop: '10px'}}>
                <input
                  onChange={e => this.setState({carSearchWord: e.target.value})}
                  value={carSearchWord}
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
                searchResults.map((item, i) => (
                  <div key={i} className="row">
                    <div style={{padding: '10px 0'}} className="col-xs-6">
                      {item.license}
                    </div>
                    <button
                      className="btn btn-link col-xs-6"
                      onClick={() => this.book(item.id)}>
                      Book Now
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default WaiveWorkDetails;
