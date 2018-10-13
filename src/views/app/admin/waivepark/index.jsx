import React, {Component} from 'react';
import {api, auth} from 'bento';
import {snackbar} from 'bento-web';
import Space from '../../components/user/user-parking/space.jsx';

class WaivePark extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spaces: [],
    };
  }

  componentDidMount() {
    this.getSpaces();
  }

  getSpaces = () => {
    api.get('/parking', (err, response) => {
      if (err) {
        snackbar.notify({
          type: 'danger',
          message: 'Error fetching spaces.',
        });
      }
      console.log('response: ', response);
      this.setState({spaces: response});
    });
  };

  toggleSpace = (spaceId, type) => {
    // This toggles certain properties of a parking space.
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
    // This deletes a space of a certain id.
    if (confirm(`Are you sure you want to remove WaivePark ${spaceId}`)) {
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
    // This updates a particular parking space and is currently used to update notes.
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
    // This is for removing cars from a space.
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
    let {getSpaces, toggleSpace, deleteSpace, updateSpace, removeCar} = this;
    return (
      <div className="container">
        <div className="box full">
          <h3>WaivePark Spaces</h3>
          <div className="box-content">
              <div className="btn-group" role="group" style={{marginBottom: '30px'}}>
                <button
                  className="btn btn-primary-outline btn-wave"
                  onClick={() => getSpaces()}>
                  Refresh Status
                </button>
              </div>
            {spaces &&
              spaces.map((space, i) => (
                <Space
                  key={i}
                  space={space}
                  toggleSpace={toggleSpace}
                  deleteSpace={deleteSpace}
                  updateSpace={updateSpace}
                  removeCar={removeCar}
                  space={space}
                  admin={auth.user().hasAccess('admin')}
                  key={i}
                  fromList={true}
                />
              ))}
          </div>
        </div>
      </div>
    );
  };
}

export default WaivePark;
