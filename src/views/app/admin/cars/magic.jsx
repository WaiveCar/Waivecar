import React from 'react';
import { api, auth, relay, dom }  from 'bento';

var _ = require('lodash');

module.exports = class Magic extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      action: null,
      car : null
    };
    dom.setTitle('Magic');
  }

  doTrick(position) {
    this.setState({action: 'Looking around...'});
    let act = this.props.params && this.props.params.act || 'retrieve';
    api.put(`/magic/${ act }?latitude=${ position.coords.latitude }&longitude=${ position.coords.longitude }`, {}, (err, res) => {
      if(res.car) {
        this.setState({action: act, car: res.car[0] });
      } else if(res.candidates) {
        this.setState({action: "Nearby Cars (" + act + ")" });
        this.setState({candidates: res.candidates.sort((a, b) => {
            return a.distance - b.distance;
          })
        });
      } else {
        this.setState({action: 'failed'});
      }
    });
  }

  beBoring(act, car) {
    if(!_.isString(car)) {
      car = this.state.car.id;
    }

    this.setState({action: 'Working...'});
    api.put(`/cars/${ car }/${ act }`, {}, (err, res) => {
      this.setState({ action: act });
    });
  }

  chooseaCar(i) {
    let act = this.props.params && this.props.params.act || 'retrieve';
    let car = this.state.candidates[i];
    this.setState({car: car, candidates: undefined});
    this.beBoring(act, car.id);
  }

  fail(what) {
    console.log("failure", what);
  }

  findMe() {
    navigator.geolocation.getCurrentPosition(this.doTrick.bind(this), this.fail, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  }
  componentDidMount() {
    this.findMe();
  }

  carInfo(car) {
      let state = <span>
        { car.isImmobilized ? <i class="fas fa-stop-circle"></i> : '' }
        { car.userId ? <i class="fa fa-user-circle"></i> : '' }
        { car.isLocked ? <i class="fa fa-lock"></i> : '' }
        { car.inRepair ? <i class="fa fa-wrench"></i> : '' }
        { car.isCharging ? <i class="fa fa-bolt"></i> : '' }
      </span>

      return <span>{ car.license } { state } (<em>{ car.charge }%</em>)</span>
  }

  showCandidates() {
    var rows = this.state.candidates.map((row, i) => {
      let car = this.state.candidates[i];

      return <button className='btn' onClick={ this.chooseaCar.bind(this, i) }>{ this.carInfo(car) }</button>
    });
    return <div> { rows } </div>
  }
  showControls() {
    var rows = ['rentable', 'retrieve', 'lock','unlock','lock-immobilizer','unlock-immobilizer','available','unavailable'].map((verb) => {
      return <button className='btn' onClick={ this.beBoring.bind(this, verb) }>{ verb }</button>
    });
    return <div> { rows } </div>
  }

  render() {
    dom.setTitle(`${ this.state.action } Magic`);

    return (
      <div className="magic">
        <h1> { this.state.action } { this.state.car ? this.carInfo(this.state.car) : '' } </h1>
        { this.state.candidates ? this.showCandidates() : '' }
        { this.state.car ? this.showControls() : '' }
      </div>
    );
  }
}
