import React from 'react';
import { api, relay, dom }  from 'bento';

module.exports = class Magic extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      car : null
    };
    dom.setTitle('Magic');
  }

  findCar(position) {
    api.put('/magic/unlock?latitude=' + position.latitude + '&longitude=' + position.longitude, {}, (err, res) => {
      if(res.car) {
        this.setState({car: res.car.license });
      } else {
        this.setState({car: 'failed' });
      }
    });
  }

  fail(what) {
    console.log("failure", what);
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(this.findCar, this.fail, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  }

  render() {
    return (
        <div>
`         <h1> { this.state.car } </h1>
        </div>
    );
  }
}
