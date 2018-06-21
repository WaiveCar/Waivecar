import React from 'react';
import { api }  from 'bento';

var _ = require('lodash');

module.exports = class Magic extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      actionText: null,
      action: null,
      car : null
    };
  }

  componentDidMount() {
    if(this.props && this.props.params) {
      this.setState({action: this.props.params.act });
    }
    this.findMe();
  }

  doTrick(position) {
    this.setState({actionText: 'Looking around...'});
    let act = this.state.action || 'retrieve';
    api.put(`/magic/${ act }?latitude=${ position.coords.latitude }&longitude=${ position.coords.longitude }`, {}, (err, res) => {
      if(res.car) {
        this.setState({actionText: act, car: res.car[0] });
      } else if(res.candidates) {
        this.setState({actionText: "Nearby (" + act + ")" });
        this.setState({candidates: res.candidates.sort((a, b) => {
            return a.distance - b.distance;
          })
        });
      } else {
        this.setState({actionText: 'failed'});
      }
    });
  }

  beBoring(act, car) {
    if(!_.isString(car)) {
      car = this.state.car.id;
    }

    this.setState({actionText: 'Working...'});
    api.put(`/cars/${ car }/${ act }`, {}, (err, res) => {
      this.setState({ action: act, actionText: act });
    });
  }

  chooseaCar(i) {
    let act = this.state.action || 'retrieve';
    let car = this.state.candidates[i];
    this.setState({car: car});
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

  carInfo(car) {
      let htmlList = [];
      let klass = '';
      let checkList = [
        ['isImmobilized', 'stop'],
        ['userId', 'user'],
        ['isLocked', 'lock'],
        ['inRepair', 'wrench'],
        ['isCharging', 'bolt']
      ];

      checkList.forEach((row) => {
        let className = (car[row[0]] ? "active" : "inactive") + " fa fa-" + row[1];
        htmlList.push( <i className={ className }></i> );
      })

      if(!car.isLocked && !car.isImmobilized && !car.userId) {
        klass = 'warning';
      }

      return <span className={ klass }>{ htmlList } { car.license } <em>{ car.charge }%</em></span>
  }

  showCandidates() {
    var rows = this.state.candidates
      .sort((a,b) => { return b.charge - a.charge })
      .map((row, i) => {
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

  setAction(what) {
    this.setState({
      actionText: "Nearby (" + what + ")",
      action: what
    });
  }

  showCarList() {
    this.setState({car: undefined});
  }

  renderCarHeader() {
    return <span>
        { this.carInfo(this.state.car) }
        <div><a onClick={ this.showCarList.bind(this) }>car list</a></div>
      </span>
  }

  renderLinks() {
    return <div>
      <a onClick={ this.setAction.bind(this, 'unlock') }>unlock</a> <a onClick={ this.setAction.bind(this, 'lock') }>lock</a> <a onClick={ this.setAction.bind(this, 'rentable') }>rentable</a> <a onClick={ this.setAction.bind(this, 'retrieve') }>retrieve</a>
    </div>
  }

  renderSearch() {
    return <div />
  }

  render() {
    return (
      <div className="magic">
        <h1> { this.state.actionText } { this.state.car ? this.renderCarHeader() : this.renderLinks() } </h1>
        { (this.state.candidates && !this.state.car) ? this.showCandidates() : '' }
        { this.state.car ? this.showControls() : '' }
        { !this.state.car && this.renderSearch() }
      </div>
    );
  }
}
