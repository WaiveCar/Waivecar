import React, {Component} from 'react';
import ParkingActions from '../../components/user/user-parking/parking-actions.jsx';
import Space from '../../components/user/user-parking/space.jsx';
import {api, auth} from 'bento';
import {snackbar} from 'bento-web';

export default class ParkingShow extends ParkingActions {
  constructor(props) {
    super(props);
    this.state = {
      space: null,
    };
  }

  componentDidMount() {
    this.getSpaces(this.props.params.id);
  }

  getSpaces = (id) => {
    console.log('id: ', id)
    api.get(`/parking/${id}`, (err, space) => {
      if (err) {
        return snackbar.notify({
          type: 'danger',
          message: `Error: ${err.message}`,
        });
      }
      console.log('space: ', space);
      this.setState({space});
    });
  }

  render = () => {
    let {getSpaces, toggleSpace, deleteSpace, updateSpace, removeCar} = this;
    let {space} = this.state;
    return (
      <div>
        Parking Show
        {space && (
          <Space
            space={space}
            toggleSpace={toggleSpace}
            deleteSpace={deleteSpace}
            updateSpace={updateSpace}
            removeCar={removeCar}
            space={space}
            admin={auth.user().hasAccess('admin')}
            show={true}
          />
        )}
      </div>
    );
  };
}
