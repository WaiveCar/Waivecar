import React   from 'react';
import moment  from 'moment';
import { Map } from 'bento-web';
import { api } from 'bento';

module.exports = class CarsIndex extends React.Component {

  constructor(...options) {
    super(...options);

    this.state = {
      cars : [],
      filter : ""
    };
  }

  componentDidMount() {


    api.get(`/cars`, (err, cars) => {
      this.setState( {cars: cars } );
    });


  }

  onFilter(event) {
    this.setState({filter: event.target.value});
  }

  isCarIncludes(car, str) {
    for (var fldName in car) {
      if (car[fldName].toString().includes(str))
        return true
    }
    return false;
  }

  renderCheckMark(checked) {
    if (checked) {
      return (
        <span className="text-success"><i className="material-icons" role="true">check</i></span>
      )
    } else {
      return (
        <span className="text-muted"><i className="material-icons" role="true">close</i></span>
      )
    }
  }

  renderCarRow(car) {
    return (
      <tr className="standard-row">
        <td>{car.license}</td>
        <td>{car.charge}</td>
        <td>{car.currentSpeed}</td>
        <td className="table-col-xs">{ this.renderCheckMark(car.isIgnitionOn )}</td>
        <td className="table-col-xs">{ this.renderCheckMark(car.isKeySecure )}</td>
        <td className="table-col-xs">{ this.renderCheckMark(car.isLocked )}</td>
        <td className="table-col-xs">{ this.renderCheckMark(car.isImmobilized )}</td>
        <td className="table-col-xs">{ this.renderCheckMark(car.isCharging )}</td>
        <td className="table-col-xs">{ this.renderCheckMark(car.isAvailable )}</td>
        <td className="table-col-lg"><span>{ car.updatedAt }</span></td>
        <td><div className="text-center"><a className="grid-action" href={"/cars/" + car.id}><i className="material-icons" role="edit">edit</i></a></div></td>
      </tr>
    )
  }

  render() {

    if (!this.state.cars.length)
      return (false);

    return (
      <div className="cars-index" >
        <section className="container" >
          <div className="row">
            <div className="col-xs-12" >
              <div className="map-dynamic">
                <Map
                    markerIcon = { '/images/map/active-waivecar.svg' }
                    markers    = { this.state.cars }
                  />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12" >
              <div id="table-component" className="component-container" >
                <div className="griddle" >
                  <div className="top-section" >
                    <div className="griddle-filter" >
                      <div className="filter-container" >
                        <input type="text"
                               name="filter"
                               placeholder="Filter Results"
                               className="form-control"
                               value={this.state.filter}
                               onChange={ (e) => this.onFilter(e)}
                          />
                      </div>
                    </div>
                  </div>

                  <div className="griddle-container">
                    <div className="griddle-body">
                      <div>
                        <table>
                          <thead>
                          <tr>
                            <th data-title="license"><span>License</span></th>
                            <th data-title="charge"><span>Charge</span></th>
                            <th data-title="currentSpeed"><span>Speed</span></th>
                            <th data-title="isIgnitionOn" className="table-col-xs"><span>Ignition</span></th>
                            <th data-title="isKeySecure" className="table-col-xs"><span>Key Secure</span></th>
                            <th data-title="isLocked" className="table-col-xs"><span>Locked</span></th>
                            <th data-title="isImmobilized" className="table-col-xs"><span>Immobilized</span></th>
                            <th data-title="isCharging" className="table-col-xs"><span>Charging</span></th>
                            <th data-title="isAvailable" className="table-col-xs"><span>available</span></th>
                            <th data-title="updatedAt" className="table-col-lg"><span>Updated At</span></th>
                            <th data-title="actions" ><span>Actions</span></th>
                          </tr>
                          </thead>
                          <tbody>
                          {
                            this.state.cars.filter((car) => this.isCarIncludes(car, this.state.filter) ).map((car) => this.renderCarRow(car))
                          }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

};
