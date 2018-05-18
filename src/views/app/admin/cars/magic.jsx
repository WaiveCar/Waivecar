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

  doTrick(position) {
    this.setState({action: 'processing...'});
    let act = this.props.params && this.props.params.act || 'retrieve';
    api.put(`/magic/${ act }?latitude=${ position.coords.latitude }&longitude=${ position.coords.longitude }`, {}, (err, res) => {
      if(res.car) {
        this.setState({action: act, car: res.car });
      } else if(res.candidates) {
        this.setState({action: "Nearby Cars" });
        this.setState({candidates: res.candidates.sort((a, b) => {
            return a.distance - b.distance;
          })
        });
      } else {
        this.setState({action: 'failed'});
      }
    });
  }

  beBoring(act) {
    api.put(`/cars/${ this.state.car.id }/${act}`, {}, (err, res) => {
      this.setState({ action: verb });
    });
  }

  chooseCar(i) {
    let act = this.props.params && this.props.params.act || 'retrieve';
    this.setState({car: this.state.candidates[i]});
    this.beBoring(act);
  }

  fail(what) {
    console.log("failure", what);
  }

  findMe() {
    navigator.geolocation.getCurrentPosition(this.doTrick.bind(this), this.fail.bind(this), {
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
        <h1> { this.state.action } { this.state.car ? this.state.car.license : '' } </h1>
        { this.state.candidates ?
          <div>
            { this.state.candidates.sort((a, b) => {
                return a.distance - b.distance;
              }).map((row, i) => {
                return <button className='btn' onClick={ this.chooseCar.call(this, i) }>{ row.license }</button> 
              })
            }
          </div> : ''
        }
        { this.state.car ?
          <div>
            { ['lock','unlock','lock-immobilizer','unlock-immobilizer','available','unavailable'].map((act) => {
                return <button className="btn" onClick={ this.act.call(this, act) }>{ act }</button>
              })
            }
          </div> : ''
        }
      </div>
    );
  }
}
