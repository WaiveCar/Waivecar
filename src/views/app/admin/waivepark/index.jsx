import React, {Component} from 'react';
import {api, auth} from 'bento';
import {snackbar} from 'bento-web';
import ParkingActions from '../../components/user/user-parking/parking-actions.jsx';
import Space from '../../components/user/user-parking/space.jsx';
import {GMap} from 'bento-web';

export default class WaivePark extends ParkingActions {
  componentDidMount() {
    this.getSpaces();
  }

  getSpaces = () => {
    api.get('/parking', (err, spaces) => {
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
    let {getSpaces, toggleSpace, deleteSpace, updateSpace, removeCar} = this;
    let markers = spaces.map(space => space.location);
    return (
      <div className="container">
        <div className="box full">
          <h3>WaivePark Spaces</h3>
          <div className="box-content">
            {spaces.length && (
              <div className="row">
                <div className="col-xs-12">
                  <div className="map-dynamic">
                    <GMap
                      markerIcon={'/images/map/active-waivecar.svg'}
                      markers={markers}
                    />
                  </div>
                </div>
              </div>
            )}
            <div
              className="btn-group"
              role="group"
              style={{marginBottom: '30px'}}>
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
