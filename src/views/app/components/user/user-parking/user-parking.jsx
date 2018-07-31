import React, {Component} from 'react';
import {api, relay} from 'bento';
import {snackbar} from 'bento-web';
import AddSpaces from './add-spaces';
import Space from './space';

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
      this.setState({spaces}, () => console.log('state: ', this.state));
    });
  }

  addSpace = opts => {
    let {userId} = this.props;
    opts.userId = userId;
    opts.notes && !opts.notes.length && delete opts.notes;
    console.log('opts: ', opts);
    if (!opts.address.length) {
      return snackbar.notify({
        type: 'danger',
        message: 'Please enter an address for this parking space',
      });
    }
    api.post('/parking', opts, (err, response) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: `Error: ${err}`,
        });
      }
      this.setState({spaces: [...this.state.spaces, response]});
    });
  };

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
          {spaces.map((space, i) => <Space space={space} key={i} />)}
          <AddSpaces addSpace={this.addSpace} />
        </div>
      </div>
    );
  };
}
