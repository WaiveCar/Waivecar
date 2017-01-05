import React, { Component, PropTypes } from 'react';
import moment  from 'moment';
import { Map } from 'bento-web';

class RideDetails extends Component {

  static propTypes = {
    start: PropTypes.object.isRequired,
    end: PropTypes.object.isRequired,
    fee: PropTypes.number.isRequired
  }

  render() {
    let { start, end, fee } = this.props;
    return (
      <tr className="ride-details">
        <td colSpan="6">
          <div className="row">
            <div className="col-md-4">
              <div className="ride-map">
                <Map
                  markerIcon = { '/images/map/active-waivecar.svg' }
                  markers    = {[
                    {
                      longitude : start.longitude,
                      latitude  : start.latitude,
                      type      : 'start'
                    },
                    {
                      longitude : end.longitude,
                      latitude  : end.latitude,
                      type      : 'end'
                    }
                  ]}
                />
              </div>
            </div>
            <div className="col-md-4 ride-meta">
              <div className="ride-fee">
                { fee ? `$${fee}` : 'Free Ride' }
              </div>
              <div className="ride-date">
                { moment(start.createdAt).format('dddd, MMMM Do YYYY h:mm a') }
              </div>
              <div className="ride-from">
                <img src="/images/map/icon-start.svg" className="ride-icon" />
                <div className="ride-time">{ moment(start.createdAt).format('h:mm A') }</div>
                { start.address }
              </div>
              <div className="ride-to">
                <img src="/images/map/icon-end.svg" className="ride-icon" />
                <div className="ride-time">{ moment(end.createdAt).format('h:mm A') }</div>
                { end.address }
              </div>
            </div>
            <div className="col-md-4 ride-car">
              <div className="ride-car-meta">
                <img src="/images/cars/chevy_spark.png" />
                <h3>Chevy Spark EV 2015</h3>
                <div>
                  Distance Traveled<br/>
                  <strong>{ (end.mileage - start.mileage).toFixed(2) } miles</strong>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  }

}

module.exports = RideDetails;
