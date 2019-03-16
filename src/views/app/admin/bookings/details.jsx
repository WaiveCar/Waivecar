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
      }
  }

  getAddress(lat, long, data, i, lastObject) {
    let url = `http://basic.waivecar.com/location.php`;
    let qs  = `latitude=${ lat }&longitude=${ long }`;
    debugger;
    api.external(url,qs, (err,addressSite) => {
      data.address[i] = addressSite;
      if (lastObject) {
        console.log(lastObject);
        console.log(data.address);
      }
      this.setState();
    });
  }

  getTTime(time) {
    return [
      Math.floor(time/3.6e6), //hours
      Math.floor(time/6e4)%60, //minutes
      Math.floor(time/1000)%60 //seconds
    ];
  }
  componentDidMount() {
    var ix = 0;
    var ival = setInterval(function(){
      var tempDriving = 0, tempStill = 0, lastLat = 0, lastLong = 0, lastTime = 0;
      if (this.props.carPath.length != 0) {
        clearInterval(ival);
        var data = {time:[], switchStat: [], address: []};
        this.setState({
          startTime : this.props.carPath[0][2],
          finishTime : this.props.carPath[this.props.carPath.length - 1][2]
        });
        var j = 0;
        for (var i = 0; i < this.props.carPath.length; i++) {
          /*console.log(i);
          console.log(JSON.stringify(this.props.carPath[i])); */
          //If the car just started
          if(this.props.carPath[i][2] == this.state.startTime) {
            this.getAddress(this.props.carPath[i][0],this.props.carPath[i][1],data,j);
            j++
            data.switchStat.push('started');
          }
          //If the car just finished
          else if (this.props.carPath[i][2] == this.state.finishTime) {
            //If the car has been driving and finished being used
            if (tempDriving != 0) {
              tempDriving = tempDriving + (new Date(this.props.carPath[i][2]).getTime() - new Date(lastTime).getTime());
              data.time.push(this.getTTime(tempDriving)); //hours
              this.getAddress(this.props.carPath[i][0],this.props.carPath[i][1],data,j, true);
              j++
              tempDriving = 0;
              data.switchStat.push('endWDrive');
              //If the car has been stationary and finished being used
            } else {
              tempStill = tempStill + (new Date(this.props.carPath[i][2]).getTime() - new Date(lastTime).getTime());
              data.time.push(this.getTTime(tempStill));
              this.getAddress(this.props.carPath[i][0],this.props.carPath[i][1],data,j, true);
              j++
              tempStill = 0;
              data.switchStat.push('endWStop');
            }
          }
          //If car is not moving
          else if (Math.abs(this.props.carPath[i][0] - lastLat) < .0002 && Math.abs(this.props.carPath[i][1] - lastLong) < .0002 ) {
            if(tempDriving != 0) {
              data.switchStat.push('notMoving');
              data.time.push(this.getTTime(tempDriving)); //hours
              data.time.push(this.props.carPath[i-1][2]);
              this.getAddress(this.props.carPath[i][0],this.props.carPath[i][1],data,j);
              j++
              tempDriving = 0;
            } else {
              data.switchStat.push('unnecessaryStop');
            }
            tempStill = tempStill + (new Date(this.props.carPath[i][2]).getTime() - new Date(lastTime).getTime());
          }
          //If car is moving
          else {
            if (tempStill != 0) {
              data.switchStat.push('startMove');
              data.time.push(this.getTTime(tempStill)); //hours
              tempStill = 0;
            } else {data.switchStat.push('unnecessaryMove');}
            tempDriving = tempDriving + (new Date(this.props.carPath[i][2]).getTime() - new Date(lastTime).getTime());
          }
          lastLat = this.props.carPath[i][0];
          lastLong = this.props.carPath[i][1];
          lastTime = this.props.carPath[i][2];
          /*console.log(JSON.stringify(data));
          console.log(JSON.stringify(data.switchStat)); */
        }
        /*
        var length = data.time.length;
        for(var i = 0; i < length ;i++) {
          data.time.push(data.time[i]);
        }
        length = data.switchStat.length;
        for(var i = 0; i < length ;i++) {
          data.switchStat.push(data.switchStat[i]);
        }*/
        this.setState(data);
      }
    }.bind(this), 1000);
  }

  render() {
    var ride = null, data = null, duration = null, carTimeline = null, indexT = 0, indexA = 0;
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

      // ###Car Timeline
      carTimeline = {
        switchStat : this.state.switchStat,
        address : this.state.address,
        time: this.state.time
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
              this.props.carPath && this.props.carPath[0] &&
              <div className="box-content">
                <strong>Car Timeline </strong><br/>
                {//here for debugging purposes
                  /*this.state.switchStat.map((stat,i) => {
                  return (<div key = {i}>
                    {i}
                    {stat}
                  <br/>
                  </div>)
                })*/}
                {this.props.carPath.map((path, i) => {
                  switch(this.state.switchStat[i]) {
                    case "started":
                    {indexA++};
                    return (<div key = {i}>
                      Address: {carTimeline.address[indexA-1]}, Time: {moment(path[2]).format('h:mm:ss a')}
                    </div>);
                    break;
                    case "endWDrive":
                    {indexA++; indexT++}
                    return (<div key = {i}>
                      Car has been <span style={{color: 'green'}}>driving </span>
                      for {carTimeline.time[indexT-1][0]}:{carTimeline.time[indexT-1][1]}:
                      {carTimeline.time[indexT-1][2]}
                      <br/> Address: {carTimeline.address[indexA-1]}, Time: {moment(path[2]).format('h:mm:ss a')}
                    </div>);
                    break;
                    case "endWStop":
                    {indexA++; indexT++;}
                    return (<div key = {i}>
                      Car has been <span style = {{color: 'red'}}>still </span>
                      for {carTimeline.time[indexT-1][0]}:{carTimeline.time[indexT-1][1]}:
                      {carTimeline.time[indexT-1][2]}
                      <br/> Address: {carTimeline.address[indexA-1]}, Time: {moment(path[2]).format('h:mm:ss a')}
                    </div>);
                    break;
                    case "notMoving":
                    {indexA++; indexT++;indexT++}
                    return (<div key = {i}>
                      Car has been <span style={{color: 'green'}}>driving </span>
                      for {carTimeline.time[indexT-2][0]}:{carTimeline.time[indexT-2][1]}:
                      {carTimeline.time[indexT-2][2]}
                      <br/> Address: {carTimeline.address[indexA-1]}, Time: {moment(carTimeline.time[indexT-1]).format('h:mm:ss a')}
                    </div>);
                    break;
                    case "startMove":
                    {indexT++}
                    return (<div key = {i}>
                      Car has been <span style = {{color: 'red'}}>still </span>
                      for {carTimeline.time[indexT-1][0]}:{carTimeline.time[indexT-1][1]}:
                      {carTimeline.time[indexT-1][2]}
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
