
import React                 from 'react';
import moment                from 'moment';
import mixin                 from 'react-mixin';
import { Link, History }           from 'react-router';
import Switch                from 'react-toolbox/lib/switch';
import { auth, relay, dom, api }  from 'bento';
import { fields }            from 'bento-ui';
import { Form, Button, Map, snackbar } from 'bento-web';
import Service               from '../../lib/car-service';
import NotesList from '../components/notes/list';

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
    relay.subscribe(this, 'cars');
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
    relay.unsubscribe(this, 'cars');
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

  updateUser(event) {
    this.setState({user_find_name: null, user_find_id: event.target.value});
  }

  findUser() {
    let user_id = this.state.user_find_id;
    if (parseInt(user_id) == user_id) {
      api.get(`/users/${ user_id }`, (err, user) => {
        if (err) {
          return snackbar.notify({
            type    : `danger`,
            message : err.message
          });
        }
        this.setState({user_find_name: [[user_id, `${user.firstName} ${user.lastName}`]]});
      });
    } else {
      api.get(`/users?search="${ user_id }"`, (err, userList) => {
        if (err) {
          return snackbar.notify({
            type    : `danger`,
            message : err.message
          });
        }
        this.setState({
          user_find_name: userList.map((row) => {
            return [ row.id, `${row.firstName} ${row.lastName}` ]
          })
        });
      });
    }
  }

  bookCar(user_id) {
    // Looking at the code I belive it's a POST to /bookings
    // with a userId of the driver to drive and the carId of
    //
    // Why the carId is so deeply entrenched is bs I'm not willing
    // to get into right now.
    let data = { 'source': 'web', 'userId': user_id, 'carId': this.state.car.cars[0].id };
    api.post('/bookings', data, (err, user) => {
      if(err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }
      // This seems to update the screen. There's probably better ways
      // but I have no idea how this rube goldberg contraption works.
      this.service.setCar(this.id());
    })
  }

  renderCarMedia(car) {
    let geo = car.latitude + ',' + car.longitude 
    return (
      <div className="box">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12">
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
                <div className="hidden-lg-up visible-md-down text-center">
                  <a className="btn btn-link btn-sm col-xs-6" style={{ float: "none" }} href={ "geo:" + geo + '?q=' + geo + '(' + car.license + ')' }>Open in Maps</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCarForm(car) {
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

  renderCarIndicators(car) {
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
                    <span className="pull-right">{ this.renderBoolean(car.isKeySecure) }</span>
                    Key Secure
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isChargeCardSecure) }</span>
                    Charge Card Secure
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isLocked) }</span>
                    Locked
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isIgnitionOn) }</span>
                    Ignition
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isImmobilized) }</span>
                    Immobilized
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isAvailable) }</span>
                    Available
                    { !car.isAvailable && <span className="user-link">&nbsp;<em>allocated to { car.user ? `${ car.user.firstName } ${ car.user.lastName }` : `user ${ car.userId }` }</em></span> }
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
                    <span className="pull-right">{ car.currentSpeed }</span>
                    Current Speed
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ car.charge }</span>
                    Charge Level
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ car.range }</span>
                    Range
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isCharging) }</span>
                    Charging
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

  toggleAvailable(car) {
    if (car.isAvailable) {
      this.service.executeCommand(car, 'unavailable');
    } else {
      if (car.booking) {
        snackbar.notify({
          type    : 'danger',
          message : 'Car is in active rental.'
        });
      } else {
        this.service.executeCommand(car, 'available');
      }
    }
  }

  toggleHidden(car) {
    if (car.adminOnly) {
      this.service.executeCommand(car, 'visible');
    } else {
      if (car.booking) {
        snackbar.notify({
          type    : 'danger',
          message : 'Car is in active rental. Hide from app anyway?',
          action : {
            title : 'CONTINUE',
            click : () => {
              snackbar.dismiss();
              this.service.executeCommand(car, 'hidden');
            }
          }
        });
      } else {
        this.service.executeCommand(car, 'hidden');
      }
    }
  }

  renderUserSearch(car) {
    if(!this.state.user_find_name) {
      return '';
    }
    return this.state.user_find_name.map((row) => {
      let user_id = row[0], user_name = row[1];

      return (
        <div className='row'>
          <div style={{ padding: "10px 0" }} className="col-xs-6"><a target='_blank' href={ `/users/${ user_id }` }>#{user_id}</a> { user_name }</div>
          <button className="btn btn-link col-xs-6" onClick={ this.bookCar.bind(this, user_id) }>Book { car.license }</button>
        </div>
      )
    });
  }

  renderCarActions(car) {
    if (this.service.getState('isLoading')) {
      return (
        <div className="box">
          <h3>
            Controls for { car.license }
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
      },
      {
        ref : 3,
        checked  : car.isAvailable,
        label    : car.isAvailable ? 'Make Unavailable' : 'Make Available',
        onChange : this.toggleAvailable.bind(this, car)
      },
      {
        ref : 4,
        checked  : !car.adminOnly,
        label    : car.adminOnly ? 'Show in App' : 'Hide in App',
        onChange : this.toggleHidden.bind(this, car)
      },
      {
        ref : 5,
        label    : 'Refresh Cloudboxx Data',
        onChange : this.service.executeCommand.bind(this, car, 'refresh')
      }
    ];
    return (
      <div className="box">
        <h3>
          Controls for { car.license }
        </h3>
        <div className="box-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-6">
                <Switch { ...switches[0] } />
              </div>
              <div className="col-md-6">
                <Switch { ...switches[1] } />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Switch { ...switches[2] } />
              </div>
              <div className="col-md-6">
                <Switch { ...switches[3] } />
              </div>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <div className="col-md-6">
                {
                  (car.booking && car.user) ?
                    <div>
                      <a style={{ marginRight: "10px" }} href={ `/users/${ car.userId }` }>{ car.user.firstName + " " + car.user.lastName }</a>
                      Booking #<a href={ `/bookings/${ car.booking.id }` }>{ car.booking.id }</a> 
                    </div>
                  : <div> 
                      <div className="row" style={{ marginTop: "4px" }}>
                        <input 
                          onChange={ this.updateUser.bind(this) }
                          value={ this.state.user_find_id } 
                          style={{ marginTop: "1px", padding: "2px", height: '40px' }} 
                          className="col-xs-6" 
                          placeholder="Name or ID" 
                        />
                        <button className="btn btn-primary btn-sm col-xs-6" onClick={ this.findUser.bind(this) }>Find User</button>
                      </div>
                      <div className={ `row ${ this.state.user_find_name ? '' : 'hide' }` }>
                        { this.renderUserSearch(car) }
                      </div>
                    </div>
                }
              </div>
              <div className="col-md-6">
                <Button
                  key       = { switches[4].ref }
                  className = { 'btn btn-primary-outline' }
                  type      = { 'button' }
                  value     = { switches[4].label }
                  onClick   = { switches[4].onChange }
                />
                Updated: { car.lastUpdated }
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 text-center">
                <div className="p-t">
                  <small className="text-danger hidden-xs-down">WARNING: These actions may remotely access and control the car</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderNotes(car) {
    return (
      <NotesList type='car' identifier={ car.id }></NotesList>
    );
  }

  renderLastUpdate(car) {
    let updated = moment(car.updatedAt).format('h:mm.ss YY-MM-DD');

    return (
      <div className="pull-right">
        <span><em>updated { updated }</em></span>
      </div>
    );
  }

  render() {
    let car = this.service.getState('cars').find(c => c.id === this.id());

    if (!car || !car.id) {
      return <div className="text-center">Retrieving Car...</div>
    }
    dom.setTitle(car.license);

    return (
      <div className="cars cars-show">
        { this.renderCarForm(car) }
        { this.renderCarActions(car) }
        { this.renderCarMedia(car) }
        { this.renderCarIndicators(car) }
        { this.renderNotes(car) }
        { this.renderLastUpdate(car) }
      </div>
    );
  }

}

module.exports = CarsShowView;
