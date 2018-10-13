import {Component} from 'react';
import {api} from 'bento';
import {snackbar} from 'bento-web';

export default class ParkingActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spaces: [],
    };
  }

  addSpace = opts => {
    // This makes a new parking space.
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
      this.setState({spaces: [...this.state.spaces, response]}, () => {
        return snackbar.notify({
          type: 'success',
          message: 'WaiveSpot successfully created!',
        });
      });
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
      this.getSpaces(this.props.params && this.props.params.id);
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
        this.getSpaces(this.props.params && this.props.params.id);
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
        this.getSpaces(this.props.params && this.props.params.id);
        return snackbar.notify({
          type: 'success',
          message: `Car removed from space #${space.id}`,
        });
      });
    }
  };
}
