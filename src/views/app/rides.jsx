'use strict';

import React                     from 'react';
import moment                    from 'moment';
import { auth, relay, api, dom } from 'bento';

module.exports = class ProfileView extends React.Component {

  constructor(...args) {
    super(...args);
    dom.setTitle('My Rides');
    this.state = {
      bookings : []
    };
    relay.subscribe(this, 'me');
  }

  componentDidMount() {
    api.get('/bookings', (err, bookings) => {
      if (err) {
        return console.log(err);
      }
      this.setState({
        bookings : bookings
      });
    });
  }

  booking(data) {
    return (
      <tbody key={ data.id }>
        <tr className="ride-row">
          <td className="text-center">
            <i className="material-icons">keyboard_arrow_right</i>
          </td>
          <td>
            { moment(data.createdAt).format('DD/MM/YYYY') }
          </td>
          <td>
            Coming Soon
          </td>
          <td>
            { data.carId }
          </td>
          <td>
            Coming Soon
          </td>
          <td>
            { data.status }
          </td>
        </tr>
        <tr className="ride-details">
          <td colSpan="6">
            <div className="row">
              <div className="col-md-4 ride-map">
                Map
              </div>
              <div className="col-md-4 ride-meta">
                Meta
              </div>
              <div className="col-md-4 ride-rating">
                Rating
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  /**
   * Rdner the profile view.
   * @return {Object}
   */
  render() {
    return (
      <div className="rides">
        <div className="box full">
          <h3>
            My Rides
            <small>
              Your current, and past ride history.
            </small>
          </h3>
          <div className="box-content no-padding">
            <table className="table-rides">
              <thead>
                <tr>
                  <th width="24"></th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Car</th>
                  <th>Fee</th>
                  <th>Status</th>
                </tr>
              </thead>
              {
                this.state.bookings.map((data) => {
                  return this.booking(data)
                })
              }
            </table>
          </div>
        </div>
      </div>
    );
  }

}
