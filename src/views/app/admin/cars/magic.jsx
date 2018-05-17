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
    console.log(position, arguments);
    let act = this.props.params && this.props.params.act || 'unlock';
    api.put('/magic/' + act + '?latitude=' + position.coords.latitude + '&longitude=' + position.coords.longitude, {}, (err, res) => {
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
    navigator.geolocation.getCurrentPosition(this.findCar.bind(this), this.fail.bind(this), {
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
