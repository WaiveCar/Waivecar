import React, {Component} from 'react';
import {api, relay} from 'bento';
import {snackbar} from 'bento-web';
import AddSpaces from './add-spaces';
import Space from './space';

export default class UserParking extends Component {
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

  addSpace = opts => {
    let {userId} = this.props;
    opts.userId = userId;
    opts.notes && !opts.notes.length && delete opts.notes;
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
          message: `Error: ${err.message}`,
        });
      }
      this.setState({spaces: [...this.state.spaces, response]});
    });
  };

  toggleSpace = (spaceId, type) => {
    api.put(`/parking/${spaceId}/toggle/${type}`, {}, err => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: `Error: ${err.message}`,
        });
      }
      this.getSpaces();
    });
  };

  deleteSpace = spaceId => {
    if (confirm(`Are you sure you want to delete space ${spaceId}`)) {
      api.delete(`/parking/${spaceId}`, (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: `Error: ${err.message}`,
          });
        }
        this.getSpaces();
      });
    }
  };

  updateSpace = (spaceId, opts) => {
    api.put(`/parking/${spaceId}/update`, opts, (err, result) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: `Error: ${err.message}`,
        });
      }
      return snackbar.notify({
        type: 'success',
        message: 'Space successfully updated',
      });
    });
  };

  removeCar = carId => {
    if (confirm('Are you sure you want to remove this car from the space?')) {
    api.put(`/parking/vacate/${carId}`, {}, (err, space) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: `Error: ${err.message}`,
        });
      }
      this.getSpaces();
      return snackbar.notify({
        type: 'success',
        message: `Car removed from space #${space.id}`,
      });
    });
    }
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
          <span>Parking Spaces:</span>
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
                admin={admin}
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
