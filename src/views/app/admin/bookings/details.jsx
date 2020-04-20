import React   from 'react';
import moment  from 'moment';
import { GMap } from 'bento-web';
import { api } from 'bento'
var _ = require('lodash');

module.exports = class RideDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      site : null,
      startTime : null,
      finishTime : null,
      lastLat : null,
      lastLong : null,
      lastTime : null,
      address : [],
      switchStat : [],
      time : [],
      lat : [],
      lng : [],
      smallPath : null
    };
    this._user = this.props._user
  }

  getAddress(lat, lng, data, i) {
    let url = `https://basic.waivecar.com/location.php`;
    let qs  = `latitude=${ lat }&longitude=${ lng }`;

    api.external(url,qs, (err,addressSite) => {
      data.address[i] = addressSite;
      this.setState({});
    });
  }

  getTTime(time) {
    var hours = Math.floor(time/3.6e6);
    var minutes = Math.floor(time/6e4)%60 ;
    if(minutes < 10) {
      minutes = " " + minutes;
    }
    return (hours ? hours + "h " : "   ") + minutes + "m";
  }
  componentDidMount() {
    var ix = 0;
    var threshold = 0.0004;
    if (this._user.hasAccess('waiveAdmin')) {
      var ival = setInterval(function(){
        var tempDriving = 0, tempStill = 0, lastLat = 0, lastLong = 0, lastTime = 0;
        if (this.props.carPath.length != 0) {
          clearInterval(ival);
          var data = {time:[], switchStat: [], address: [], lat: [], lng: []};
          //This waivework related code due to wanting to limit the amount of data points
          //when the booking is a waive work
          var isNotWaiveWork = Object.keys(this.props.booking.flags).every((flag) => {
            return (flag != "Waivework")
          })
          var carPath
          if(!isNotWaiveWork || this.props.carPath.length > 800) {
            carPath = this.props.carPath.slice((this.props.carPath.length-800))
          } else {
            carPath = this.props.carPath
          }
          this.setState({
            smallPath : carPath,
            startTime : carPath[0][2],
            finishTime : carPath[carPath.length - 1][2]
          });
          var j = 0;
          for (var i = 0; i < carPath.length; i++) {
            //If the car just started
            if(carPath[i][2] == this.state.startTime) {
              this.getAddress(carPath[i][0],carPath[i][1],data,j);
              j++
              data.switchStat.push('started');
              data.lat.push(carPath[i][0]);
              data.lng.push(carPath[i][1]);
            }
            //If the car just finished
            else if (carPath[i][2] == this.state.finishTime) {
              //If the car has been driving and finished being used
              if (tempDriving != 0) {
                tempDriving = tempDriving + (new Date(carPath[i][2]).getTime() - new Date(lastTime).getTime());
                data.time.push(this.getTTime(tempDriving)); //hours
                this.getAddress(carPath[i][0],carPath[i][1],data,j);
                data.lat.push(carPath[i][0]);
                data.lng.push(carPath[i][1]);
                j++
                tempDriving = 0;
                data.switchStat.push('endWDrive');
                //If the car has been stationary and finished being used
              } else {
                tempStill = tempStill + (new Date(carPath[i][2]).getTime() - new Date(lastTime).getTime());
                data.time.push(this.getTTime(tempStill));
                this.getAddress(carPath[i][0],carPath[i][1],data,j);
                data.lat.push(carPath[i][0]);
                data.lng.push(carPath[i][1]);
                j++
                tempStill = 0;
                data.switchStat.push('endWStop');
              }
            }
            //If car is not moving
            else if (Math.abs(carPath[i][0] - lastLat) < threshold && Math.abs(carPath[i][1] - lastLong) < threshold ) {
              if(tempDriving != 0) {
                data.switchStat.push('notMoving');
                data.time.push(this.getTTime(tempDriving)); //hours
                data.time.push(carPath[i-1][2]);
                this.getAddress(carPath[i][0],carPath[i][1],data,j);
                data.lat.push(carPath[i][0]);
                data.lng.push(carPath[i][1]);
                j++
                tempDriving = 0;
              } else {
                data.switchStat.push('unnecessaryStop');
              }
              tempStill = tempStill + (new Date(carPath[i][2]).getTime() - new Date(lastTime).getTime());
            }
            //If car is moving
            else {
              if (tempStill != 0) {
                data.switchStat.push('startMove');
                data.time.push(this.getTTime(tempStill)); //hours
                tempStill = 0;
              } else {data.switchStat.push('unnecessaryMove');}
              tempDriving = tempDriving + (new Date(carPath[i][2]).getTime() - new Date(lastTime).getTime());
            }
            lastLat = carPath[i][0];
            lastLong = carPath[i][1];
            lastTime = carPath[i][2];
          }
          this.setState(data);
        }
      }.bind(this), 1000);
    };
  }

  render() {
    var ride = null, data = null, duration = null, carTimeline = null, indexT = 0, indexA = 0;
    try {
      data = this.props.booking;
      window.booking = this.props.booking

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

      // ###Car Timeline
      carTimeline = {
        switchStat : this.state.switchStat,
        address : this.state.address,
        time : this.state.time,
        latitude : this.state.lat,
        longitude : this.state.lng
      }
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
	      heatmap 	=  {true }
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
                  <div className="ride-time">{ moment(ride.start.createdAt).format('MMMM Do h:mm A') }</div>
                  { ride.start.address }
                </div>
                <div className="ride-to">
                  <img src="/images/map/icon-end.svg" className="ride-icon" />
                  <div className="ride-time">{ moment(ride.end.createdAt).format('MMMM Do h:mm A') }</div>
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
                  <div>
                    <div>Charge Change</div>
                    <strong>{ride.end.charge - ride.start.charge}%</strong>
                  </div>
                </div>
              </div>
            </div>
            {
              this._user.hasAccess('waiveAdmin') && this.state.switchStat && this.state.switchStat[0] &&
              <div className="box-content timeline">
                <strong>Timeline</strong><br/>
                {this.state.smallPath.map((path, i) => {
                  switch(this.state.switchStat[i]) {
                    case "started":
                      {indexA++};
                      return (<div key = {i}>
                        <span className="address">
                          <span className='time'>
                            {moment(path[2]).format('h:mm:ss a')}
                          </span>
                          <a target='_blank' href={`https://maps.google.com/?q=${carTimeline.latitude[indexA-1]},${carTimeline.longitude[indexA-1]}`}>{carTimeline.address[indexA-1]}</a>
                        </span>
                      </div>);
                    break;
                    case "endWDrive":
                      {indexA++; indexT++}
                      return (<div key = {i}>
                        <span className='duration'>
                          {carTimeline.time[indexT-1]}
                        </span>
                        <span>driving </span>
                        <br/>
                        <span className="address">
                          <span className='time'>
                            {moment(path[2]).format('h:mm:ss a')}
                          </span>
                          <a target='_blank' href={`https://maps.google.com/?q=${carTimeline.latitude[indexA-1]},${carTimeline.longitude[indexA-1]}`}>{carTimeline.address[indexA-1]}
                          </a>

                        </span>
                      </div>);
                    break;
                    case "endWStop":
                    {indexA++; indexT++;}
                    return (<div key = {i}>
                        <span className='duration'>
                          {carTimeline.time[indexT-1]}
                        </span>
                        <span>parked</span>
                      <br/>
                      <span className="address">
                        <span className='time'>
                          {moment(path[2]).format('h:mm:ss a')}
                        </span>
                        <a target='_blank' href={`https://maps.google.com/?q=${carTimeline.latitude[indexA-1]},${carTimeline.longitude[indexA-1]}`}>{carTimeline.address[indexA-1]}
                        </a>
                      </span>
                    </div>);
                    break;
                    case "notMoving":
                      {indexA++; indexT++;indexT++}
                      return (<div key = {i}>
                          <span className='duration'>
                            {carTimeline.time[indexT-2]}
                          </span>
                          <span>driving </span>
                        <br/>
                        <span className="address">
                          <span className='time'>
                           {moment(carTimeline.time[indexT-1]).format('h:mm:ss a')}
                          </span>
                          <a target='_blank' href={`https://maps.google.com/?q=${carTimeline.latitude[indexA-1]},${carTimeline.longitude[indexA-1]}`}>{carTimeline.address[indexA-1]}</a>
                        </span>
                      </div>);
                    break;
                    case "startMove":
                      {indexT++}
                      return (<div key = {i}>
                        <span className='duration'>
                          {carTimeline.time[indexT-1]}
                        </span>
                        <span>parked </span>
                      </div>);
                      break;
                    default:
                    break;
                  }
                })}
              </div>
            }
          </div>
        </div>
      </div>
    );
  }

};
