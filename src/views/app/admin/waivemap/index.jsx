import React             from 'react';
import moment            from 'moment';
import {GMap}            from 'bento-web';
import { api, dom }      from 'bento';
//import Draw from 'ol/interaction/Draw';

class CarMap extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      cars : [],
      filter : {},
      rectangle : {},
      sortBy: { key: "datetime", orderAsc: true }
    };

    this.columns = {

    }
  }

/*  api.get(`/carsWithBookings`, (err, cars) => {
    this.setState({
      cars: cars,
    });
  });
*/
  componentDidMount() {
    dom.setTitle("WaiveMap");
  }
  render() {
    return(
      <div id="waiveMap" className="container">
        <div className="box full">
          <h3> WaiveMap </h3>
          <div className="row">
            <div className="col-xs-12">
              <div className="map-dynamic">
              <GMap/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
};

module.exports = CarMap;
