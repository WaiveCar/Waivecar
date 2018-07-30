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
    console.log('UserParking props: ', this.props);
    console.log('State: ', this.state);
  }

  render = () => {
    let {spaces} = this.props;
    return (
      <div className="box">
        <h3>
          <span>Parking Spaces</span>
          <small>Manage parking spaces</small>
        </h3>
        <div className="box-content">Some text here</div>
      </div>
    );
  };
}
