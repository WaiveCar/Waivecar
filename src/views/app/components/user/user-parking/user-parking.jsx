import React, {Component} from 'react';
import {api, relay} from 'bento';

export default class UserParking extends Component {
  constructor(props) {
    super(props);
    relay.subscribe(this, 'users');
    this.state = {
      spaces: [],
    };
  }

  componentDidMount() {
    let {userId} = this.props;
    api.get(`/parking/users/${userId}`, (err, spaces) => {
      if (err) {
        console.log('error: ', err);
      }
      console.log('spaces: ', spaces);
      this.setState({spaces}, () => console.log('state: ', this.state));
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
          <h4>Your parking spaces</h4>
          <div>
            {spaces.map(space => <div>A space</div>)}
          </div>
        </div>
      </div>
    );
  };
}
