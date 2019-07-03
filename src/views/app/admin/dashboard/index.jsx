import React from 'react';
import {Map, Charts} from 'bento-web';
import {api} from 'bento';

let {MiniChart} = Charts;

module.exports = class DashboardIndex extends React.Component {
  constructor(...options) {
    super(...options);

    this.state = {
      cars: [],
      bookings: [],
      users: [],

      bookingsCount: {
        now: 0,
        weekAgo: 0,
      },
      usersCount: {
        now: 0,
        weekAgo: 0,
      },
    };
  }

  update() {
    api.get(`/dashboard`, (err, data) => {
      this.setState(
        {
          bookingsCount: data.bookingsCount,
          usersCount: data.usersCount,
          currentWaiveworkBookingsCount: data.currentWaiveworkBookingsCount,
          carsInRepairCount: data.carsInRepairCount,
          carsInWaiveworkCount: data.carsInWaiveworkCount,
        }
      );
    });

    api.get(`/carsWithBookings`, (err, cars) => {
      this.setState({
        cars: cars,
      });
    });

    /* api.get(`/bookings?limit=100`, (err, bookings) => {
      this.setState( {
        bookings: bookings
      } );
    });
    api.get(`/users?limit=100`, (err, users) => {
      this.setState( {
        users: users
      } );
    });*/
  }

  componentDidMount() {
    this.update();
  }

  renderCount(counts) {
    let newUsersPercent =
      ((counts.now - counts.weekAgo) / counts.weekAgo) * 100;

    return (
      <h2>
        {counts.now} (+ {newUsersPercent.toFixed(2)}% )
      </h2>
    );
  }

  render() {
    if (!this.state.cars.length) {
      return false;
    }

    return (
      <section className="container">
        <div className="row">
          <div className="col-xs-6">
            <div className="mini-chart2-container chart-bluegray">
              <div className="count">
                <small>Users</small>
                {this.renderCount(this.state.usersCount)}
              </div>
            </div>
          </div>
          <div className="col-xs-6">
            <div className="mini-chart2-container chart-bluegray">
              <div className="count">
                <small>Bookings</small>
                {this.renderCount(this.state.bookingsCount)}
              </div>
            </div>
          </div>
          <div className="col-xs-6">
            <div className="mini-chart2-container chart-bluegray">
              <div className="count">
                <small>Current WaiveWork Bookings</small>
                {this.state.currentWaiveworkBookingsCount}
              </div>
            </div>
          </div>
          <div className="col-xs-6">
            <div className="mini-chart2-container chart-bluegray">
              <div className="count">
                <small>Cars in Repair</small>
                {this.state.carsInRepairCount}
              </div>
            </div>
          </div>
          <div className="col-xs-6">
            <div className="mini-chart2-container chart-bluegray">
              <div className="count">
                <small>Cars in WaiveWork</small>
                {this.state.carsInWaiveworkCount}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xs-12">
            <div className="map-dynamic">
              <Map
                markerIcon={'/images/map/active-waivecar.svg'}
                markers={this.state.cars}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
};
