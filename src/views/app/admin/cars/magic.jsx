import React from 'react';
import { api, auth, relay, dom }  from 'bento';

module.exports = class Magic extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      action: null,
      car : null
    };
    dom.setTitle('Magic');
  }

  doAct(position) {
    console.log(position, arguments);
    let act = this.props.params && this.props.params.act || 'unlock';
    api.put(`/magic/${ act }?latitude=${ position.coords.latitude }&longitude=${ position.coords.longitude }`, {}, (err, res) => {
      if(res.car) {
        this.setState({action: act, car: res.car });
      } else {
        this.setState({car: { license: 'failed' } });
      }
    });
  }

  lock() {
    api.put(`/car/${ this.state.car.id }/lock}`, {}, (err, res) => {
      this.setState({ action: lock });
    });
  }
  unlock() {
    api.put(`/car/${ this.state.car.id }/unlock}`, {}, (err, res) => {
      this.setState({ action: unlock });
    });
  }

  fail(what) {
    console.log("failure", what);
  }

  findMe() {
    navigator.geolocation.getCurrentPosition(this.doAct.bind(this), this.fail.bind(this), {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  }
  componentDidMount() {
    this.findMe();
  }

  render() {
    dom.setTitle(`${ this.state.action } Magic`);

    return (
      <div>
        <h1> { this.state.action }{ this.state.car ? this.state.car.license : '' } </h1>
        { this.state.action ?
          <div>
            <button className="btn" onClick={ this.lock() }>lock</button>
            <button className="btn" onClick={ this.unlock() }>unlock</button>
          </div> : ''
        }
      </div>
    );
  }
}
