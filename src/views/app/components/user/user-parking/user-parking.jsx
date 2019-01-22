import React, {Component} from 'react';
import {api, relay, auth} from 'bento';
import {snackbar} from 'bento-web';
import ParkingActions from './parking-actions';
import AddSpaces from './add-spaces';
import Space from './space';

export default class UserParking extends ParkingActions {
  constructor(props) {
    super(props);
    relay.subscribe(this, 'userParking');
    this.state = {
      spaces: [],
    };
  }

  componentDidMount() {
    this.getSpaces();
  }

  getSpaces = () => {
    // This gets all spaces belonging to the userId associated with this component.
    let {userId} = this.props;
    api.get(`/parking/users/${userId}`, (err, spaces) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: `Error: ${err.message}`,
        });
      }
      this.setState({spaces});
    });
  };

  render = () => {
    let {spaces} = this.state;
    let {admin} = this.props;
    let {
      getSpaces,
      addSpace,
      toggleSpace,
      deleteSpace,
      updateSpace,
      removeCar,
    } = this;
    return (
      <div className="box parking-box">
        <h3>
          <span>Parking Spaces</span>
          <small>Manage parking spaces</small>
        </h3>
        <div className="box-content">
          <h4>{admin ? "User's" : 'My'} parking spaces:</h4>
          <div className="form-actions text-center refresh-button">
            <div className="btn-group" role="group">
              <button
                className="btn btn-primary-outline btn-wave"
                onClick={() => getSpaces()}>
                Refresh Status
              </button>
            </div>
          </div>
          {spaces.length ? (
            spaces.map((space, i) => (
              <Space
                toggleSpace={toggleSpace}
                deleteSpace={deleteSpace}
                updateSpace={updateSpace}
                removeCar={removeCar}
                space={space}
                admin={auth.user().hasAccess('admin')}
                key={i}
              />
            ))
          ) : (
            <div className="no-spaces">No spaces added yet</div>
          )}
          <AddSpaces addSpace={addSpace} />
        </div>
      </div>
    );
  };
}
