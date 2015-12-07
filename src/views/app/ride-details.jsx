'use strict';

import React   from 'react';
import moment  from 'moment';
import { Map } from 'bento-web';

module.exports = class RideDetails extends React.Component {

  render() {
    let { start, end, fee } = this.props;
    return (
      <tr className="ride-details">
        <td colSpan="6">
          <div className="row">
            <div className="col-md-4">
              <div className="ride-map">
                <Map
                  markerIcon = { '/images/map/active-waivecar.svg' }
                  markers    = {[
                    {
                      longitude : start.longitude,
                      latitude  : start.latitude
                    },
                    {
                      longitude : end.longitude,
                      latitude  : end.latitude
                    }
                  ]}
                />
              </div>
            </div>
            <div className="col-md-4 ride-meta">
              <div className="ride-fee">
                ${ fee }
              </div>
              <div className="ride-date">
                { moment(start.time).format('dddd, MMMM Do YYYY h:mm a') }
              </div>
            </div>
            <div className="col-md-4 ride-rating">
              Rating
            </div>
          </div>
        </td>
      </tr>
    );
  }

}
