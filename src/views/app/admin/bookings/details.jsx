import React   from 'react';
import moment  from 'moment';
import { GMap } from 'bento-web';
var _ = require('lodash');

module.exports = class RideDetails extends React.Component {


  render() {
    var ride = null, data = null, duration = null;
    try {
      data = this.props.booking;

      // ### Ride

      ride = {
        start : data.details.find(val => val.type === 'start'),
        end   : data.details.find(val => val.type === 'end'),
        fee   : data.payments.reduce((value, payment) => { return value + (payment.amount - payment.refunded); }, 0) / 100,
        carName : data.car.license
      };
      if(data.car.make) {
        ride.carName = data.car.make + ' ' + data.car.model + (data.car.year ? ' ' + data.car.year : '');
      }

      // If the ride is in progress we should render it
      // up to this point.
      if(!ride.end) {
        ride.end = _.last(this.props.carPath);
        if(!ride.end) {
          ride.end = _.clone(ride.start);
        }

        if(ride.end) {
          ride.end.createdAt = new Date();
        }
        ride.distance = '';
      } else {
        ride.distance = parseFloat(Math.round(((ride.end.mileage - ride.start.mileage) * 0.621371192) * 100) / 100).toFixed(2) + ' miles'
      }
      // ### Duration

      duration  = moment.duration(moment(ride.end.createdAt).diff(moment(ride.start.createdAt)));
      ride.duration = {
        raw     : duration,
        days    : duration.days(),
        hours   : duration.hours(),
        minutes : duration.minutes(),
        seconds : duration.seconds()
      };
    } catch(ex) {
      return (
        <div className="ride-details">
          <div className="box">
            <h3>Details <small>Current ride details</small></h3>
            <div className="container ride-map">
            Details not available until the ride ends
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="ride-details">
        <div className="box">
          <h3>Details <small>Current ride details</small></h3>
          <div className="container ride-map">
            <GMap
              markerIcon = { '/images/map/active-waivecar.svg' }
              markers    = {[
                {
                  longitude : ride.start.longitude,
                  latitude  : ride.start.latitude,
                  type      : 'start'
                },
                {
                  longitude : ride.end.longitude,
                  latitude  : ride.end.latitude,
                  type      : 'end'
                }
              ]}
              path      =  {this.props.carPath }
            />
          </div>
          <div className="box-content">
            <div className="row">
              <div className="col-md-6 ride-meta">
                <div className="ride-date">
                  { moment(ride.start.createdAt).format('dddd, MMMM Do YYYY h:mm a') }
                </div>
                <div className="ride-from">
                  <img src="/images/map/icon-start.svg" className="ride-icon" />
                  <div className="ride-time">{ moment(ride.start.createdAt).format('dddd, MMMM Do h:mm A') }</div>
                  { ride.start.address }
                </div>
                <div className="ride-to">
                  <img src="/images/map/icon-end.svg" className="ride-icon" />
                  <div className="ride-time">{ moment(ride.end.createdAt).format('dddd, MMMM Do h:mm A') }</div>
                  { ride.end.address }
                </div>
              </div>
              <div className="col-md-6 ride-car">
                <div className="ride-car-meta">
                  <h3>{ ride.carName }</h3>
                  <div>
                    Ride Duration<br/>
                    <strong>
                    {
                      ride.duration.days ? `${ ride.duration.days } day${ ride.duration.days !== 1 ? 's ' : ' '}` : ''
                    }
                    {
                      ride.duration.hours ? `${ ride.duration.hours } hour${ ride.duration.hours !== 1 ? 's ' : ' ' }` : ''
                    }
                    {
                      `${ ride.duration.minutes } minute${ ride.duration.minutes !== 1 ? 's' : '' }`
                    }
                    </strong>
                  </div>
                  { !ride.distance ? '' :
                      <div>
                        Distance Traveled<br/>
                        <strong>{ ride.distance }</strong>
                      </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

};
