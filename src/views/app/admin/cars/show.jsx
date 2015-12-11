
'use strict';

import React                from 'react';
import moment               from 'moment';
import mixin                from 'react-mixin';
import { History }          from 'react-router';
import Switch               from 'react-toolbox/lib/switch';
import { auth, relay, dom } from 'bento';
import { fields }           from 'bento-ui';
import { Form, Map }        from 'bento-web';
import Service              from '../../lib/car-service';

let formFields = {
  photo : [],
  car   : fields.mergeFromLayout('cars', [
    [
      { name : 'license', className : 'col-md-4 bento-form-input' },
      { name : 'id',      className : 'col-md-4 bento-form-input' },
      { name : 'vin',     className : 'col-md-4 bento-form-input' }
    ],
    [
      { name : 'make',         className : 'col-md-4 bento-form-input' },
      { name : 'model',        className : 'col-md-4 bento-form-input' },
      { name : 'manufacturer', className : 'col-md-4 bento-form-input' }
    ]
  ]),

};

@mixin.decorate(History)
class CarsShowView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {};
    dom.setTitle('Car');
    this.service = new Service(this);
  }

  handleChange = (item, value) => {
    const newState = {};
    newState[item] = value;
    this.setState(newState);
  }

  componentDidMount() {
    this.service.setCar(this.id());
  }

  componentWillUnmount() {
  }

  /**
   * @method id
   * @return {String}
   */
  id() {
    return this.props.params && this.props.params.id || 'create';
  }

  renderBoolean(val) {
    if (val === true) {
      return <span className="text-success"><i className="material-icons" role="true">check</i></span>;
    }
    return <span className="text-muted"><i className="material-icons" role="true">close</i></span>;
  }

  renderCarMedia() {
    let car = this.service.getState('car');
    return (
      <div className="box">
        <h3>{ car.license }</h3>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-6 hidden-xs-down">
              <img style={{ width : '100%' }} src="/images/cars/chevy_spark.png" />
            </div>
            <div className="col-md-6 col-xs-12">
              <div className="ride-map">
                <Map
                  markerIcon = { '/images/map/active-waivecar.svg' }
                  markers    = {[
                    {
                      longitude : car.longitude,
                      latitude  : car.latitude,
                      type      : 'start'
                    }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCarForm() {
    let car = this.service.getState('car');

    return (
      <div className="box hidden-xs-down">
        <h3>Details</h3>
        <div className="box-content">
          <Form
            ref       = "car"
            className = "bento-form-static"
            fields    = { formFields.car }
            default   = { car }
            buttons   = {[
              {
                value : 'Update',
                type  : 'submit',
                class : 'btn btn-primary btn-profile-submit'
              }
            ]}
            submit = { this.service.update }
          />
        </div>
      </div>
    );
  }

  renderCarIndicators() {
    let car = this.service.getState('car');
    return (
      <div className="box">
        <h3>
          Diagnostics
          <small>
            Current Indicators and Levels
          </small>
        </h3>
        <div className="box-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-6">
                <ul className="list-group">
                  <li className="list-group-item">
                    <span className="pull-right">{ car.charge }</span>
                    Charge Level
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ car.range }</span>
                    Range
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ car.currentSpeed }</span>
                    Current Speed
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isCharging) }</span>
                    Charging
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isAvailable) }</span>
                    Available
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ car.userId }</span>
                    User
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ car.totalMileage }</span>
                    Total Miles
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="list-group">
                  <li className="list-group-item">
                    <span className="pull-right">{ car.keyfob }</span>
                    Key Fob
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isLocked) }</span>
                    Locked
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ car.ignition }</span>
                    Ignition
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isImmobilized) }</span>
                    Immobilized
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isQuickCharging) }</span>
                    Quick Charging
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isOnChargeAdapter) }</span>
                    On Charge Adapter
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ car.boardVoltage }</span>
                    CloudBoxx Voltage
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCarActions() {
    if (this.service.getState('isLoading')) {
      return (
        <div className="box">
          <h3>
            Controls
          </h3>
          <div className="box-content">
            <div className="loading-panel">
              <div className="sk-cube-grid">
                <div className="sk-cube sk-cube1"></div>
                <div className="sk-cube sk-cube2"></div>
                <div className="sk-cube sk-cube3"></div>
                <div className="sk-cube sk-cube4"></div>
                <div className="sk-cube sk-cube5"></div>
                <div className="sk-cube sk-cube6"></div>
                <div className="sk-cube sk-cube7"></div>
                <div className="sk-cube sk-cube8"></div>
                <div className="sk-cube sk-cube9"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    let car = this.service.getState('car');
    let switches = [
      {
        ref : 1,
        checked  : car.isLocked,
        label    : car.isLocked ? 'Unlock Doors' : 'Lock Doors',
        onChange : this.service.executeCommand.bind(this, car, car.isLocked ? 'unlock' : 'lock')
      },
      {
        ref : 2,
        checked  : car.isImmobilized,
        label    : car.isImmobilized ? 'Deactivate Immobilizer' : 'Activate Immobilizer',
        onChange : this.service.executeCommand.bind(this, car, car.isImmobilized ? 'unlock-immobilizer' : 'lock-immobilizer')
      }
    ];
    return (
      <div className="box">
        <h3>
          Controls
        </h3>
        <div className="box-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-6 text-center">
                <Switch { ...switches[0] } />
              </div>
              <div className="col-md-6 text-center">
                <Switch { ...switches[1] } />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 text-center">
                <div className="p-t">
                  <small className="text-danger hidden-xs-down">WARNING: These actions will remotely access and control the car</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderLastUpdate() {
    let car = this.service.getState('car');
    let updated = moment(car.updatedAt).format('h:mm.ss YY-MM-DD');

    return (
      <div className="pull-right">
        <span><em>updated { updated }</em></span>
      </div>
    );
  }

  render() {
    let car = this.service.getState('car');

    if (!car.id) {
      return <div className="text-center">Retrieving Car...</div>
    }
    return (
      <div className="cars cars-show">
        { this.renderCarMedia() }
        { this.renderCarForm() }
        { this.renderCarIndicators() }
        { this.renderCarActions() }
        { this.renderLastUpdate() }
      </div>
    );
  }

}

module.exports = CarsShowView;