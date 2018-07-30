import React, {Component} from 'react';
import {api, relay} from 'bento';
import AddSpaces from './add-spaces';

export default class UserParking extends Component {
  constructor(props) {
    super(props);
    relay.subscribe(this, 'users');
    this.state = {
      spaces: [],
    };
  }

  componentDidMount() {
    this.getSpaces();
  }

  getSpaces() {
    let {userId} = this.props;
    api.get(`/parking/users/${userId}`, (err, spaces) => {
      if (err) {
        console.log('error: ', err);
      }
      console.log('spaces: ', spaces);
      this.setState({spaces}, () => console.log('state: ', this.state));
    });
  }

  addSpace(opts) {
    api.post('/parking', options, (err, response) => {
      if (err) {
        console.log('error: ', err);
      }
      console.log('response: ', response);
    });
  }

  render = () => {
    let {spaces} = this.state;
    return (
      <div className="box">
        <h3>
          <span>Parking Spaces</span>
          <small>Manage parking spaces</small>
        </h3>
        <div className="box-content">
          <AddSpaces />
          <h4>Your parking spaces</h4>
          <div>{spaces.map((space, i) => <div key={i}>A space</div>)}</div>
        </div>
      </div>
    );
  };
}
